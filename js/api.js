// API wrapper. Resolution order:
//   1. design-environment Claude shim (window.claude) — free, used in canvas
//   2. serverless proxy (Cloudflare Worker) — holds the owner's key server-side
//      so end users translate WITHOUT entering a key
//   3. fallback: user's own Anthropic key (only when the proxy is unreachable
//      or rate-limited) — kept hidden in normal use, surfaced via settings.

window.CT_API = (function () {
  const KEY_STORAGE = 'ct_api_key_v1';

  // Serverless proxy endpoint. The owner's Anthropic key lives here, never in
  // the browser. See worker/ for the Cloudflare Worker that backs this.
  const PROXY_URL = 'https://convotrans-proxy.jenny3d.workers.dev/translate';

  function getKey() {
    try { return localStorage.getItem(KEY_STORAGE) || ''; } catch (e) { return ''; }
  }
  function setKey(k) {
    try { localStorage.setItem(KEY_STORAGE, k); } catch (e) {}
    window.dispatchEvent(new CustomEvent('ct-api-key-set'));
  }
  function clearKey() {
    try { localStorage.removeItem(KEY_STORAGE); } catch (e) {}
    window.dispatchEvent(new CustomEvent('ct-api-key-set'));
  }

  // Calls the serverless proxy. Resolves to the translated text on success.
  // On a transient failure (network error, rate limit, or proxy 5xx) it throws
  // an Error tagged `canFallback = true` so complete() can try the user's key.
  async function callProxy(prompt) {
    let res;
    try {
      res = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
    } catch (e) {
      const err = new Error('PROXY_UNREACHABLE');
      err.canFallback = true;
      throw err;
    }
    let data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) {
      const msg = data?.error || `Proxy HTTP ${res.status}`;
      // Rate-limited or server-side trouble → let the caller fall back.
      if (res.status === 429 || res.status >= 500) {
        const err = new Error(msg);
        err.canFallback = true;
        throw err;
      }
      // Bad request / blocked origin etc. — a real error, no fallback.
      throw new Error(msg);
    }
    return data.text || '';
  }

  async function callAnthropic(key, prompt) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.error?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    const text = (data.content || []).find(b => b.type === 'text')?.text || '';
    return text;
  }

  async function complete(prompt) {
    // 1) Prefer the design-environment shim when present (free for the user).
    if (window.claude && typeof window.claude.complete === 'function') {
      return window.claude.complete(prompt);
    }
    // 2) Default path: the serverless proxy — no user key required.
    try {
      return await callProxy(prompt);
    } catch (err) {
      if (!err || !err.canFallback) throw err;
      // 3) Proxy unreachable or rate-limited → fall back to the user's own key
      //    if they've entered one; otherwise prompt for it.
      const key = getKey();
      if (key) return callAnthropic(key, prompt);
      window.dispatchEvent(new CustomEvent('ct-api-key-needed'));
      throw new Error('API_KEY_NEEDED');
    }
  }

  // True when running OUTSIDE the design environment. The proxy means a user
  // key is optional here (used only as a fallback), but this still gates the
  // key UI so it stays hidden inside the design canvas.
  function needsKey() {
    return !(window.claude && typeof window.claude.complete === 'function');
  }

  return { complete, getKey, setKey, clearKey, needsKey };
})();
