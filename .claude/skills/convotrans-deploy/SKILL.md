---
name: convotrans-deploy
description: Deploying ConvoTrans — the static site on GitHub Pages plus the Cloudflare Worker proxy (worker/) that hides the owner's Anthropic key so end users translate without their own key. Use this whenever deploying or configuring hosting, editing the Worker, changing the proxy URL or allowed origins, managing the API key/secret, or reasoning about the security/cost-control model of the proxy.
---

# ConvoTrans Deployment

Two pieces: a **static front end** and a **serverless proxy**.

## 1. Static site → GitHub Pages

Plain HTML/JS/JSX, no build step. Deploy by serving the repo root.

1. Public repo on GitHub, push the full folder (keep structure intact).
2. Settings → Pages → Source: **Deploy from a branch** → `main` / `/ (root)`.
3. Entry points: `Translator.html` (app), `index.html`, `design.html`,
   `tour.html` (screenshot tour, supports `?embed` for iframing).
4. Custom domain via `CNAME` (currently `convotrans.jennyryu3d.com`).

## 2. Serverless proxy → Cloudflare Worker (`worker/`)

The proxy holds the **owner's** Anthropic key server-side so the browser app
translates with **no user-entered key**. Frontend does `POST /translate` with
`{ prompt }`; the Worker injects the key + fixed model/params, returns `{ text }`.

- Code: `worker/src/index.js`. Config: `worker/wrangler.toml`. Full click-by-click
  deploy steps (dashboard **and** CLI): `worker/README.md`.
- Frontend points at it via `PROXY_URL` in `js/api.js`
  (currently `https://convotrans-proxy.jenny3d.workers.dev/translate`). If the
  Worker URL changes, update `PROXY_URL` **and** `ALLOWED_ORIGINS`.

### Deploy / update the Worker

- **Dashboard:** Compute (Workers) → edit code → paste `worker/src/index.js` →
  Deploy. Set the key under Settings → Variables and Secrets → add **Secret**
  `ANTHROPIC_API_KEY` (type Secret/encrypted, never plaintext).
- **CLI:** `cd worker && wrangler secret put ANTHROPIC_API_KEY && wrangler deploy`.

### Security / cost-control model (don't weaken these)

- **Model + `max_tokens` are hardcoded** server-side (`MODEL = claude-haiku-4-5`,
  `MAX_TOKENS = 1024`). The client sends only `{ prompt }` — it can never pick an
  expensive model or huge token count.
- **`MAX_PROMPT_CHARS` (8000)** caps input to block token bombs.
- **`ALLOWED_ORIGINS`** allowlist + CORS. Update this list when the site's domain
  changes, or browser calls get a 403.
- Roadmap in-code: step 2 = tighten Origin/Referer; step 3 = Workers KV rate
  limiting (`RATE_LIMIT_KV` binding activates the `rateLimit()` hook
  automatically once bound). The hook is a safe no-op until then.

## Fallback behavior (ties into `convotrans-translate`)

If the proxy is unreachable (network) or rate-limited (429/5xx), `js/api.js`
falls back to the user's own key from `localStorage` (`ct_api_key_v1`). With no
key, it surfaces a friendly `ct-api-key-needed` notice rather than forcing entry.

## Privacy note (keep accurate in README/privacy.html)

With the proxy live, the owner's key stays server-side and users need no key.
The legacy direct-from-browser path only runs as a fallback with a user's own
key. Don't reintroduce shipping a real key in client code.
