# ConvoTrans Skills

Reusable [Agent Skills](https://code.claude.com/docs) for working on this
project. Each skill is a folder with a `SKILL.md` (YAML frontmatter + Markdown).
The format is **the same one Claude apps and Claude Code both use**, so these are
portable — see "Using these elsewhere" below.

## The five skills

| Skill | What it covers |
|---|---|
| `convotrans-design` | Brand palette, typography, CSS tokens, brand rules (no flags, circular ISO chips) |
| `convotrans-component` | No-build React-in-browser `.jsx` + `window.CT_*` global-module conventions |
| `convotrans-translate` | `window.CT_API` wrapper + Claude prompt patterns (translate / polish / 3 suggestions) |
| `convotrans-i18n` | Language registry (`CT_LANGS`), STT/TTS locales, `CT_UI` / `window.t()` localization |
| `convotrans-deploy` | GitHub Pages static hosting + Cloudflare Worker proxy that hides the API key |

## How they activate

In **Claude Code** (this repo), skills under `.claude/skills/` are discovered
automatically. Claude reads a skill's `SKILL.md` when the task matches its
`description`, so keep descriptions specific about *when* to use each one.

## Using these elsewhere (web / desktop / mobile)

Skills are portable across Claude surfaces:

- **Claude Code** — already wired up here (this folder).
- **Claude.ai web / desktop app** — go to **Settings → Capabilities → Skills**
  and upload a skill. Zip an individual skill folder (e.g. `convotrans-design/`
  so that `SKILL.md` sits at the zip's top level) and upload it. Requires the
  Skills capability to be enabled on your plan.
- **Claude mobile app** — you **can't create or upload** skills on mobile (the
  management UI is web/desktop only), but once a skill is uploaded from
  web/desktop it's available to use on mobile too.

So the workflow is: author/edit here in the repo → zip a folder → upload once on
web or desktop → use everywhere including mobile.
