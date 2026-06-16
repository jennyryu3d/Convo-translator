// ConvoTrans serverless proxy — Cloudflare Worker
// ----------------------------------------------------------------------------
// Holds the owner's Anthropic API key server-side so the browser never sees it.
// The frontend calls POST /translate with { prompt }; this Worker injects the
// key + fixed model/params and returns just the translated text.
//
// STEP 1 (this file): skeleton, hidden key, /translate, fixed model, CORS.
// STEP 2 will tighten Origin/Referer checks.
// STEP 3 will add Workers KV rate limiting (the `rateLimit` block below
//         activates automatically once a RATE_LIMIT_KV binding exists).
//
// Bindings expected (set in the Cloudflare dashboard — see worker/README.md):
//   - ANTHROPIC_API_KEY  (Secret / encrypted env var)  [required]
//   - RATE_LIMIT_KV      (KV namespace binding)         [optional until step 3]
// ----------------------------------------------------------------------------

// Origins allowed to call this Worker from a browser.
const ALLOWED_ORIGINS = [
  'https://convotrans.jennyryu3d.com',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

// Server-fixed model config. The client cannot override these — this is the
// core defense against cost-blowup / abuse.
const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 1024;
const ANTHROPIC_VERSION = '2023-06-01';

// Cap input size so nobody can send a token bomb.
const MAX_PROMPT_CHARS = 8000;

// Soft rate limits (enforced via Workers KV — only active once RATE_LIMIT_KV is
// bound; see worker/README.md step 3). Tune these freely.
const IP_PER_MIN     = 20;    // burst guard: max requests per IP per minute
const IP_PER_DAY     = 300;   // per-user daily cap (one person can't drain the key)
const GLOBAL_PER_DAY = 3000;  // total daily budget across ALL users (cost guard)

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : '';
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  if (allow) headers['Access-Control-Allow-Origin'] = allow;
  return headers;
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    // --- CORS preflight ---
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // --- Routing ---
    if (url.pathname !== '/translate') {
      return json({ error: 'Not found' }, 404, origin);
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, origin);
    }

    // --- Origin allowlist (basic; hardened in step 2) ---
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return json({ error: 'Origin not allowed' }, 403, origin);
    }

    // --- Key must be configured server-side ---
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'Server not configured' }, 500, origin);
    }

    // --- Parse + validate input ---
    let prompt;
    try {
      const data = await request.json();
      prompt = data?.prompt;
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, origin);
    }
    if (typeof prompt !== 'string' || prompt.trim() === '') {
      return json({ error: 'Missing "prompt"' }, 400, origin);
    }
    if (prompt.length > MAX_PROMPT_CHARS) {
      return json({ error: 'Prompt too long' }, 413, origin);
    }

    // --- Rate limit (no-op until RATE_LIMIT_KV is bound in step 3) ---
    if (env.RATE_LIMIT_KV) {
      const rl = await rateLimit(env.RATE_LIMIT_KV, request);
      if (rl.limited) {
        return new Response(
          // `reason` lets the app show the right message: 'rate' (this device
          // is going too fast/much) vs 'quota' (today's shared budget is spent).
          JSON.stringify({ error: 'Rate limit exceeded', reason: rl.reason }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              // Daily budget resets at UTC midnight; per-user caps clear sooner.
              'Retry-After': rl.reason === 'quota' ? '3600' : '60',
              ...corsHeaders(origin),
            },
          }
        );
      }
    }

    // --- Call Anthropic with the server-held key + fixed params ---
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || `Upstream HTTP ${res.status}`;
        // Surface the upstream status + error type so failures are diagnosable.
        return json({
          error: msg,
          // 'busy' = upstream is rate-limited/overloaded; 'down' = upstream error.
          reason: res.status === 429 ? 'busy' : 'down',
          upstreamStatus: res.status,
          upstreamType: data?.error?.type || null,
        }, res.status === 429 ? 429 : 502, origin);
      }

      const text = (data.content || []).find((b) => b.type === 'text')?.text || '';
      return json({ text }, 200, origin);
    } catch (e) {
      return json({ error: 'Upstream request failed' }, 502, origin);
    }
  },
};

// Soft rate limiting backed by Workers KV. Three layers:
//   1. per-IP per-minute  — burst guard against loops/abuse
//   2. per-IP per-day     — one person can't drain the shared key
//   3. global per-day     — total daily budget across everyone (cost guard);
//                           when hit, users see the "free usage used up" notice.
// KV is eventually consistent, so counts are approximate — fine for soft caps.
// Returns { limited:boolean, reason?: 'rate' | 'quota' }.
async function rateLimit(kv, request) {
  const ip  = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  const min = Math.floor(now / 60000);                  // minute bucket
  const day = new Date(now).toISOString().slice(0, 10); // UTC date (resets midnight UTC)

  const kMin    = `ip:${ip}:min:${min}`;
  const kDay    = `ip:${ip}:day:${day}`;
  const kGlobal = `global:day:${day}`;

  const [minC, dayC, gC] = await Promise.all([
    kv.get(kMin), kv.get(kDay), kv.get(kGlobal),
  ]);
  const minN = parseInt(minC || '0', 10);
  const dayN = parseInt(dayC || '0', 10);
  const gN   = parseInt(gC   || '0', 10);

  if (gN   >= GLOBAL_PER_DAY) return { limited: true, reason: 'quota' }; // today's budget spent
  if (dayN >= IP_PER_DAY)     return { limited: true, reason: 'rate'  }; // this user's daily cap
  if (minN >= IP_PER_MIN)     return { limited: true, reason: 'rate'  }; // this user's burst cap

  // Count this request. TTLs let the buckets expire on their own.
  await Promise.all([
    kv.put(kMin,    String(minN + 1), { expirationTtl: 120   }),  // ~2 min
    kv.put(kDay,    String(dayN + 1), { expirationTtl: 90000 }),  // ~25 h
    kv.put(kGlobal, String(gN   + 1), { expirationTtl: 90000 }),
  ]);
  return { limited: false };
}
