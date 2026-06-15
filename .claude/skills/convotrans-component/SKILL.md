---
name: convotrans-component
description: How to author UI for ConvoTrans — a no-build, Babel-in-browser React 18 app using the window.CT_* global-module pattern. Use this whenever adding or editing a .jsx/.js file under js/, wiring a new screen into an HTML entry point, or when confused about why there is no bundler/import/export. Covers file layout, the global-module convention, and how scripts are loaded.
---

# ConvoTrans Component Conventions

**Tech:** Plain HTML + React 18 + Babel-in-browser. **No bundler, no node, no
build step.** You edit a file, refresh the browser, done.

## The global-module pattern

There is **no ES module `import`/`export`** here. Files communicate through
globals on `window`, namespaced `CT_*`:

- Data registries: `window.CT_LANGS`, `window.CT_UI`, `window.CT_LANG`
- API wrapper: `window.CT_API` (see the `convotrans-translate` skill)
- i18n helper: `window.t(key)` resolves a UI string in the user's helper language
- Components attach themselves, e.g. `window.LangChip = function LangChip(...) {}`

When you write a new component:

```jsx
// js/my-thing.jsx — loaded as <script type="text/babel" src="js/my-thing.jsx">
function MyThing({ prop }) {
  // ...React 18 + hooks via the global React
  return <div>...</div>;
}
window.MyThing = MyThing;   // expose it for other files / the entry HTML
```

Reference React as the global `React` (e.g. `React.useState`, `React.useRef`) —
it is loaded from a CDN in the HTML, not imported.

## Loading order matters

Scripts are listed as `<script type="text/babel">` tags in the entry HTML
(`Translator.html`, `index.html`, `design.html`). Because everything is a
global, **a file must be loaded after the globals it depends on.** When you add a
new `.jsx`, add its `<script>` tag in the right place (after its dependencies,
before its consumers).

## File layout (js/)

- `data.js`, `history.js`, `languages.js` — data/registries
- `api.js` — the `window.CT_API` wrapper
- `lang-chip.jsx`, `lang-picker.jsx`, `mascot.jsx`, `speak.jsx`,
  `drag-scroll.jsx` — small reusable pieces
- `chat-shell.jsx`, `chat-screen.jsx`, `variations.jsx` — chat UI
- `live-translator.jsx` — the main live/learn interactive prototype
- `voice-mode.jsx`, `recognize.jsx`, `search.jsx`, `settings-sheet.jsx`,
  `save-convo.jsx`, `api-key-banner.jsx` — feature modules
- `app.jsx` / `app-production.jsx` — roots
- `_backup_v1/` — old versions, ignore

## Rules

1. Match the surrounding file's style — these are hand-written, comment-rich,
   plain React. Keep that voice.
2. Expose new modules on `window` with a clear name.
3. No build tooling, no TypeScript, no JSX imports — keep it copy-paste runnable.
4. Use design tokens / brand rules from the `convotrans-design` skill.
5. After editing, the verification is: open the HTML in a browser and refresh.
