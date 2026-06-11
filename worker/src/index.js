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
      const limited = await rateLimit(env.RATE_LIMIT_KV, request);
      if (limited) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
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
        // Don't leak upstream internals; return a generic-ish error.
        return json({ error: msg }, res.status === 429 ? 429 : 502, origin);
      }

      const text = (data.content || []).find((b) => b.type === 'text')?.text || '';
      return json({ text }, 200, origin);
    } catch (e) {
      return json({ error: 'Upstream request failed' }, 502, origin);
    }
  },
};

// Placeholder used in step 3. Returns true when the caller is over the limit.
// Implemented against Workers KV; safe no-op until then.
async function rateLimit(_kv, _request) {
  return false;
}
