---
name: convotrans-translate
description: ConvoTrans's Claude API integration and prompt patterns — the window.CT_API wrapper, its shim→proxy→user-key resolution order, and the JSON-returning prompts used for translation, grammar-polish, tap-to-translate-a-word, and the 3 AI follow-up suggestions. Use this whenever calling the model from the app, writing or tuning a translation/suggestion prompt, parsing model JSON, or debugging API fallback/key behavior.
---

# ConvoTrans Translation & Prompting

## Always call through `window.CT_API`

Defined in `js/api.js`. Never call `fetch('https://api.anthropic.com...')`
directly from a component — go through the wrapper so the fallback logic and key
handling stay in one place.

```js
const res = await window.CT_API.complete(prompt);   // returns a string
```

### Resolution order inside `complete()`

1. **`window.claude.complete`** — the design-environment shim (free, used inside
   the design canvas). Preferred when present.
2. **Serverless proxy** (`PROXY_URL`, a Cloudflare Worker) — the default in
   production. The owner's Anthropic key lives server-side, so end users
   translate **without entering any key.** See the `convotrans-deploy` skill and
   `worker/`.
3. **User's own Anthropic key** — fallback only when the proxy is unreachable
   (network) or rate-limited (429 / 5xx). Stored in `localStorage` under
   `ct_api_key_v1` via `CT_API.setKey/getKey/clearKey`.

Transient proxy failures throw an `Error` tagged `canFallback = true` with a
`reason` of `'busy'` (429) or `'down'` (network/5xx). When no key is available,
`complete()` dispatches a `ct-api-key-needed` event and throws `API_KEY_NEEDED`
— it does **not** force a key prompt. `needsKey()` is true only outside the
design shim (it gates the key UI so it stays hidden in the canvas).

Model used in the direct-key path: **`claude-haiku-4-5`** (fast, cheap, good
enough for short translation turns).

## Prompt pattern: return strict one-line JSON

Every model call asks for **strict one-line JSON** and parses defensively. Match
this exact shape so parsing stays uniform:

```js
const res = await window.CT_API.complete(prompt);
const raw = String(res).trim()
  .replace(/^```json\s*/i, '')
  .replace(/```\s*$/, '');          // strip accidental code fences
let p = null;
try { p = JSON.parse(raw); } catch (e) { /* fall back to a default */ }
```

Always slice suggestions to 3: `(p.suggestions || []).slice(0, 3)` and keep a
hardcoded fallback array for parse failures.

### The three core prompt jobs (see js/live-translator.jsx)

1. **Tap-to-translate a word** — given a sentence and a tapped word, translate
   the single word by default; expand to a minimal multi-word unit only for
   idioms/phrasal verbs. Returns `{"selected":"...","translation":"..."}`.
   Results are cached by `` `${fromName}>${toName}|${sentence}|${word}` ``.

2. **3 follow-up suggestions** under a "them" message — propose 3 short replies
   the user could send next. Returns
   `{"suggestions":[{"en":"<target lang>","ko":"<full helper-lang translation>"},...]}`.
   The `"ko"` (helper-language) field MUST be a **full natural translation**, not
   a keyword/category.

3. **Learn-mode partner reply** — simulate partner "B" replying to "A" in the
   target language, then propose 3 follow-ups. Returns
   `{"reply":"...","reply_native":"...","suggestions":[...]}`. Build context from
   the last ~6 turns mapped to `A:`/`B:` lines.

## Conventions

- Language names in prompts come from `window.CT_LANG.byCode(code).native`
  (target = conversation language, native = the user's private helper language).
  See the `convotrans-i18n` skill.
- Keep prompts explicit about "strict JSON on one line" — the parser depends on it.
- Cache idempotent calls (same input → same output) to cut API cost.
