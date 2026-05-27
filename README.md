# Con·trans

> Live translation chat that suggests how to keep the conversation going.

ConvoTrans is a conversation translation app. Type in any language; it gets sent in your target language (auto-translate or grammar-polish). When the other person replies, you also get **3 AI-suggested follow-up replies** so the conversation flows naturally.

## Features

- 🌐 **14 languages** — pick conversation language + your private helper language
- ✨ **Smart input** — auto-detects what you typed and translates, polishes, or sends as-is
- 💡 **3 AI follow-up suggestions** after every reply, with 6 visual styles
- 🎙️ **Voice mode** — face-to-face live interpretation with TTS
- 🔍 **Searchable history** — find past conversations by keyword in either language
- 🌗 Light & dark, custom colors, font size, bubble shape — all tweakable

## Run locally

Just open `Translator.html` in a browser. No build step.

For translation features you need a Claude API key (entered in-app, stored in your browser's localStorage only).

## Deploy to GitHub Pages

1. Create a public repo on GitHub
2. Upload the entire folder contents (keep folder structure intact)
3. In repo Settings → Pages → Source: `Deploy from a branch` → `main` / `/ (root)` → Save
4. Wait 1–2 minutes for the deploy to finish
5. Open `https://<your-username>.github.io/<repo-name>/Translator.html`

### Privacy note

The current build calls the Anthropic API directly from the browser using the user's own API key (stored in localStorage). This is fine for personal use but **don't share a deployed link publicly if you've entered your own key** — the key is in your browser, not the site, but other users will be prompted to enter their own.

For production / public deployment, move the API call behind a serverless proxy (Cloudflare Worker, Vercel Function, Netlify Function) so the key isn't exposed.

## File layout

```
Translator.html             ← entry point
convotrans-design/
  colors_and_type.css       ← design tokens
  assets/                   ← logos
js/
  data.js                   ← brand palette + sample conversation
  history.js                ← past conversations for search demo
  languages.js              ← supported language list
  api.js                    ← API wrapper (claude.ai shim OR direct Anthropic call)
  api-key-banner.jsx        ← key entry modal
  mascot.jsx                ← character illustration
  speak.jsx                 ← TTS listen/loop helper
  drag-scroll.jsx           ← mobile-feeling drag-to-scroll
  lang-chip.jsx             ← circular ISO language tile
  voice-mode.jsx            ← face-to-face live interpretation
  search.jsx                ← keyword search overlay
  lang-picker.jsx           ← bottom-sheet language picker
  chat-shell.jsx            ← top bar, bubbles, input bar
  variations.jsx            ← 6 suggestion display styles
  chat-screen.jsx           ← reusable chat layout for variants
  live-translator.jsx       ← live interactive prototype
  app.jsx                   ← root: design canvas + sections
design-canvas.jsx           ← starter — design canvas
tweaks-panel.jsx            ← starter — tweaks UI
```

## Tech

Plain HTML + React 18 + Babel-in-browser. No bundler, no node, no build step.
