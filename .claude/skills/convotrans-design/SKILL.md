---
name: convotrans-design
description: ConvoTrans visual design system — the "malachite & gold" brand palette, typography (Chakra Petch / Plus Jakarta Sans / JetBrains Mono), CSS custom-property tokens, and brand rules. Use this whenever building or restyling any ConvoTrans UI (HTML/JSX), picking colors, choosing fonts, styling language chips, or when asked to keep something "on brand". The single source of truth is convotrans-design/colors_and_type.css.
---

# ConvoTrans Design System

The brand feeling: **"deep emerald forest cut with copper veins, warmed by pale
cream"** — premium, organic, hushed. The feeling of finally hearing someone
clearly through the noise.

## Source of truth

All tokens live in `convotrans-design/colors_and_type.css` and are loaded as CSS
custom properties on `:root`. **Never hardcode a hex value that already exists as
a token — reference the variable.** When you need a new shade, add it to the ramp
in that file rather than inlining it.

Brand assets: `convotrans-design/assets/` (`convotrans-logo.png`,
`convotrans-icon.png`, `app-icon.png`).

## Brand palette

| Token | Hex | Role |
|---|---|---|
| `--brand-cream` | `#EEE8B2` | pale yellow, softest light |
| `--brand-copper` | `#C18D52` | warm gold, accent / decorative |
| `--brand-ink` | `#081B1B` | near-black with green undertone |
| `--brand-forest` | `#203B37` | deep emerald, primary deep |
| `--brand-sage` | `#5A8F76` | mid green, supporting |
| `--brand-mint` | `#96CDB0` | light jade, **primary action** |

Each brand color has a derived 50–900 ramp (`--mint-*`, `--forest-*`,
`--cream-*`). Use the ramps for hover/active/border states; use the `--brand-*`
aliases when you specifically mean the brand anchor.

- **Primary action / CTA** → mint (`--brand-mint` / `--mint-300`)
- **Deep surfaces, dark mode base** → forest / ink
- **Decorative accents, premium touches** → copper (use sparingly)
- **Light surfaces, warm neutrals** → cream

## Typography

Loaded via Google Fonts `@import` at the top of `colors_and_type.css`:

- **Display / brand** → `Chakra Petch` — squared geometric, subtle angular cuts.
  Substitutes for the brand's "Armstrong" wide geometric. Chosen because it is
  multilingual (Latin/Thai), which matters for a translation app.
- **Body / UI** → `Plus Jakarta Sans`.
- **Mono / code / timestamps** → `JetBrains Mono`.

## Brand rules (do not violate)

1. **NO flag emoji, ever.** Languages are shown as **circular ISO chips** with a
   brand-aligned background color and the 2-letter ISO code. See `js/lang-chip.jsx`
   and the `chipBg`/`chipFg` fields in `js/languages.js`. This is intentional —
   flags are political/inaccurate for languages.
2. Reference tokens, don't hardcode hexes.
3. Copper is an accent, not a fill — keep it rare and intentional.
4. Support light **and** dark themes; the dark base is forest/ink.

## When restyling

1. Read `convotrans-design/colors_and_type.css` first to see what tokens exist.
2. Reuse existing variables; extend a ramp only when nothing fits.
3. Verify both light and dark themes still read well.
4. Keep language UI as circular ISO chips — never introduce flags.
