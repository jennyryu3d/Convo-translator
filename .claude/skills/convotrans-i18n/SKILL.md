---
name: convotrans-i18n
description: Managing ConvoTrans's supported languages and UI localization — the window.CT_LANGS registry (ISO code, native name, chip colors, BCP-47 locale), the window.CT_LANG helpers, and the window.CT_UI / window.t() localized UI strings. Use this whenever adding or editing a supported language, changing a language chip color, fixing STT/TTS locales, or localizing UI text into the user's helper language.
---

# ConvoTrans i18n & Language Registry

Source: `js/languages.js`. There are two distinct language roles in the app:

- **target** — the conversation language (what gets sent to the other person)
- **native / helper** — the user's *private* language for translations & UI hints

## Adding / editing a supported language

Append to `window.CT_LANGS`. Every entry needs:

```js
{ code: 'EN',            // 2-letter ISO, UPPERCASE — used everywhere as the key
  name: 'English',       // display name (often in the native script)
  native: 'English',     // English name of the language — used in MODEL PROMPTS
  locale: 'en-US',       // BCP-47, for SpeechRecognition (STT) + SpeechSynthesis (TTS)
  chipBg: '#0066FF',     // circular ISO-chip background (brand-aligned blue/teal family)
  chipFg: '#FFFFFF',     // chip text color
  sample: 'How can I help?' }  // short greeting shown as a preview
```

Notes:
- `native` (the English name) is what `convotrans-translate` prompts use, e.g.
  `In the ${fromName} sentence...`. Get it via `window.CT_LANG.byCode(code).native`.
- `name` is the human display label (may be in-script, e.g. `한국어`, `日本語`).
- Keep `chipBg` in the established blue→teal range so chips feel like one family.
- `locale` must be a real BCP-47 tag the browser's Web Speech API recognizes,
  or voice mode (STT/TTS) breaks for that language.

## Helpers — `window.CT_LANG`

- `byCode(code)` → the full entry (falls back to the first language)
- `prompt(code)` → the `native` (English) name, for model prompts
- `displayName(code)` → the `name`
- `locale(code)` → BCP-47 locale for speech
- `flag(code)` → **always returns null** — see the brand rule below

## Brand rule: NO flags

Languages are shown as **circular ISO chips** (`js/lang-chip.jsx`), never flag
emoji. `flag()` exists only for backward compatibility and returns `null`. Do not
reintroduce flags. (Mirrors the `convotrans-design` brand rules.)

## UI string localization — `window.CT_UI` / `window.t()`

`window.CT_UI` maps each helper-language code to a table of UI strings (labels
like `yourLanguage`, `myLanguage`, `liveMode`, `learnMode`, card controls, etc.).
`window.t(key)` resolves the current helper language's string, **falling back to
English** for any missing key.

When you add a new piece of UI copy:
1. Add the key to the `EN` table in `CT_UI` (the fallback).
2. Add translations to the other helper-language tables where known.
3. Render it via `window.t('yourKey')` — never hardcode a user-facing string.
