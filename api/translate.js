// ConvoTrans translate proxy — Vercel Serverless Function (Node).
// ----------------------------------------------------------------------------
// Holds the company Anthropic API key server-side so the browser never sees it.
// The frontend calls POST /api/translate with { prompt }; this function injects
// the key + fixed model/params and returns { text }.
//
// Because the frontend is served from the same origin (Vercel/KP), there is no
// CORS dance — the browser and this function share a domain.
//
// Setup (Vercel / KP project settings):
//   - Environment variable: ANTHROPIC_API_KEY = <company key>   [required]
//
// Note: when Krafton's internal LLM gateway becomes available, point the fetch
// below at that gateway instead of api.anthropic.com.
//
// Rate limiting: the Cloudflare version used Workers KV. On Vercel the same
// caps can be added with Vercel KV / Upstash Redis — see TODO at the bottom.
// ----------------------------------------------------------------------------

const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 1024;
const ANTHROPIC_VERSION = '2023-06-01';
const MAX_PROMPT_CHARS = 8000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  // Vercel parses JSON bodies into req.body; tolerate a raw string too.
  let prompt;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    prompt = body.prompt;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  if (typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Missing "prompt"' });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(413).json({ error: 'Prompt too long' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      const msg = (data && data.error && data.error.message) || `Upstream HTTP ${r.status}`;
      // Mirror the worker's reason tagging so the app shows the right notice.
      return res.status(r.status === 429 ? 429 : 502).json({
        error: msg,
        reason: r.status === 429 ? 'busy' : 'down',
      });
    }

    const text = (data.content || []).find((b) => b.type === 'text')?.text || '';
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: 'Upstream request failed' });
  }
}

// TODO (during migration): re-add rate limiting with Vercel KV / Upstash Redis.
//   Generous caps agreed with owner: 40/min per IP, 1000/day per IP,
//   20000/day global. Read req.headers['x-forwarded-for'] for the client IP.
