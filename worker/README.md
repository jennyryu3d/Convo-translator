# ConvoTrans proxy — Cloudflare Worker

Serverless proxy that holds the **owner's** Anthropic API key server-side, so
the browser app can translate **without any user-entered key**. The frontend
calls `POST /translate` with `{ prompt }`; the Worker injects the key + a fixed
model/params and returns `{ text }`.

This README covers **Step 1**: deploy a working `/translate` endpoint with the
key hidden. Origin hardening (step 2) and KV rate limiting (step 3) come later.

---

## Option A — Cloudflare dashboard (web, no CLI) ✅ recommended for first-timers

You only need a free Cloudflare account. No terminal, no install.

### 1. Create the Worker
1. Go to **https://dash.cloudflare.com** and sign in (create a free account if needed).
2. Left sidebar → **Compute (Workers)**  (older UI: **Workers & Pages**).
3. Click **Create application** → **Create Worker**  (older UI: **Create**).
4. Name it `convotrans-proxy`. The default subdomain becomes your URL:
   `https://convotrans-proxy.<your-subdomain>.workers.dev`
   - If it's your first Worker, Cloudflare asks you to pick a `*.workers.dev`
     subdomain once — choose anything, e.g. `jennyryu3d`.
5. Click **Deploy** (it deploys a hello-world placeholder for now).

### 2. Paste the real code
1. On the Worker's page, click **Edit code** (top right, `</>` icon).
2. In the editor, **select all** in the left file (`worker.js`) and **delete** it.
3. Open `worker/src/index.js` from this repo, copy its **entire** contents,
   and paste into the editor.
4. Click **Deploy** (top right). Wait for "Deployed".

### 3. Add your Anthropic key as a Secret (this is what hides it)
1. Go back to the Worker overview → **Settings** tab.
2. Find **Variables and Secrets**  (older UI: **Variables** → **Environment Variables**).
3. Click **Add** →
   - **Type**: `Secret`  (encrypted — important; do NOT use plaintext)
   - **Variable name**: `ANTHROPIC_API_KEY`
   - **Value**: paste your Anthropic key (`sk-ant-...`)
4. Click **Deploy** / **Save**.

> The Secret is encrypted at rest and never shown again in the dashboard or
> returned to the browser. That's the whole point — the key lives only here.

### 4. Test it
- Your endpoint is: `https://convotrans-proxy.<your-subdomain>.workers.dev/translate`
- Quick browser test from the **deployed app** (so the Origin matches): open
  the app, open DevTools → Console, and run:
  ```js
  fetch('https://convotrans-proxy.<your-subdomain>.workers.dev/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Translate to French: hello' }),
  }).then(r => r.json()).then(console.log)
  ```
  You should get `{ text: "Bonjour" }` (or similar).
- Confirm the key is hidden: in DevTools → Network, the request goes to
  `workers.dev`, and **no `sk-ant-...` appears anywhere** in headers/body.

➡️ **Send me your `workers.dev` URL** and I'll wire it into `js/api.js` (step 4).

---

## Option B — wrangler CLI (alternative)

```bash
npm install -g wrangler
wrangler login
cd worker
wrangler secret put ANTHROPIC_API_KEY   # paste sk-ant-... when prompted
wrangler deploy
```

The deploy output prints your `*.workers.dev` URL.

---

## What's fixed server-side (abuse / cost control)

- **Model + max_tokens are hardcoded** in the Worker — the client can only send
  `{ prompt }`, never pick an expensive model or huge token count.
- **Prompt length cap** (`MAX_PROMPT_CHARS`) blocks token bombs.
- **Origin allowlist** (`ALLOWED_ORIGINS`) — edit this list if your domain
  changes. Hardened further in step 2.

---

## Step 3 — Rate limiting (Workers KV)

The rate-limit code is already in `src/index.js`; it **only activates once a
`RATE_LIMIT_KV` namespace is bound.** Until then the proxy runs without limits.

The three caps live at the top of `src/index.js` — tune freely:

```js
const IP_PER_MIN     = 20;    // per-IP burst (requests / minute)
const IP_PER_DAY     = 300;   // per-IP daily cap (one user can't drain the key)
const GLOBAL_PER_DAY = 3000;  // total daily budget across ALL users (cost guard)
```

When a limit is hit the Worker returns HTTP 429 with `{ reason }`:
`'rate'` (this device is going too fast/much) or `'quota'` (today's shared
budget is spent). The app shows the matching notice; `'quota'` tells users it
refreshes tomorrow or to use their own key. Buckets reset at **UTC midnight**.

### Bind the KV namespace

**Dashboard:**
1. Cloudflare dashboard → **Storage & Databases → KV** → **Create a namespace**,
   name it e.g. `convotrans-rate`.
2. Worker `convotrans-proxy` → **Settings → Bindings → Add → KV namespace**.
   - **Variable name**: `RATE_LIMIT_KV`  (must match exactly)
   - **KV namespace**: pick `convotrans-rate`
3. **Deploy**. Limits are now live.

**CLI:**
```bash
cd worker
wrangler kv namespace create RATE_LIMIT_KV   # prints an id
# paste the id into the [[kv_namespaces]] block in wrangler.toml, then:
wrangler deploy
```
