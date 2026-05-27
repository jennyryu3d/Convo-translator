// API wrapper. Tries the design-environment Claude shim first;
// falls back to Anthropic API directly using user's own key.
//
// NOTE: Putting an Anthropic API key in the browser exposes it to the user
// of the page (which is fine for personal testing — your key, your page —
// but DO NOT share the page publicly with your key inside). For production,
// move this to a serverless proxy (Cloudflare Worker / Vercel / Netlify
// Function) that holds the key and exposes a /translate endpoint.

window.CT_API = (function () {
  const KEY_STORAGE = 'ct_api_key_v1';

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
    // Prefer the design-environment shim when present (free for the user).
    if (window.claude && typeof window.claude.complete === 'function') {
      return window.claude.complete(prompt);
    }
    const key = getKey();
    if (!key) {
      // Notify UI to open the API key sheet; reject so callers know.
      window.dispatchEvent(new CustomEvent('ct-api-key-needed'));
      throw new Error('API_KEY_NEEDED');
    }
    return callAnthropic(key, prompt);
  }

  // True when running OUTSIDE the design environment (so we depend on a key).
  function needsKey() {
    return !(window.claude && typeof window.claude.complete === 'function');
  }

  return { complete, getKey, setKey, clearKey, needsKey };
})();
