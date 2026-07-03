# AGENTS.md - P2026 Project Context

Use this file as the quick operating context for the repo. For deeper planning, check `roadmap.md`, `tasks.md`, and `backlog/`.
For a generated repo tree snapshot, check `notes/repo-structure.md`.

## Project

P2026 is a personal tech hub and build log for 2026 at **p2026.xyz**.

Goals:

- document projects, launches, and experiments as they happen
- build in public without exposing unnecessary infrastructure detail
- learn web development hands-on with a fast, readable, low-dependency site

## Stack

- Astro 5
- Markdown and MDX content collections
- custom CSS
- local bundled fonts via `@fontsource`
- GitHub Pages for production
- Netlify for previews
- GitHub Actions for deploys and release automation

## Key paths

- `p2026/src/content/blog/` for blog posts
- `p2026/src/content/projects/` for project entries
- `p2026/src/content/config.ts` for content schemas
- `p2026/src/pages/` for routes including `blog`, `projects`, `timeline`, `resources`, and `about`
- `p2026/src/styles/global.css` for global styling
- `prompts/blog_prompt.md` for blog drafting
- `notes/repo-structure.md` for the generated repo tree snapshot
- `roadmap.md`, `tasks.md`, and `backlog/` for planning

## Content model

Blog posts:

- required fields: `title`, `description`, `pubDate`
- common fields: `tags`, `project`, `draft`
- `description` should stay to one sentence and roughly 15 words max
- `project` links a post to a project slug when relevant

Projects:

- required fields: `name`, `description`, `date`, `status`
- common fields: `draft`, `featured`, `link`, `repo`, `stack`
- `status` is `shipped`, `building`, or `archived`

Publishing notes:

- projects are the primary publishing anchor
- blog posts can link back to projects by slug
- `/timeline` is generated from project dates plus blog post dates
- prefer draft-first workflows and human review over direct auto-publishing

## Design and content tone

- aesthetic: terminal-editorial dark with amber accent
- dark mode is the default; light mode follows `prefers-color-scheme`
- fonts: JetBrains Mono for headings and UI, Lora for body copy
- keep the site lightweight and avoid unnecessary dependencies or heavy third-party scripts
- content should sound like a person, not a content generator
- when making writing-related changes, favor clarity over polish-for-polish's-sake

## Current state

- local font migration is complete and should be preserved
- the site already has project pages, blog pages, RSS, and generated timeline support
- `astro.config.mjs` has no `base` set because the site runs at the apex domain
- if the site ever returns to `github.io`, re-evaluate whether `base: '/p2026'` should be restored

## Deployment

- pushing to `main` triggers the Pages deploy workflow
- build command: `pnpm run build` from `./p2026`
- output directory: `./p2026/dist`
- Node version: 24
- Netlify is preview infrastructure, not the public production host

## Git workflow

- use `feature/` for new work and `fix/` for bug fixes
- keep branches short-lived and descriptive
- `main` is both the integration and production branch for now
- `preview` is the disposable Netlify branch when a stable preview URL is useful
- prefer small, feature-scoped commits because PRs are squash-merged
- tool-specific branch prefixes are not part of the repo convention

## Codex sub-agents

- if Codex uses sub-agents in this repo, default to `gpt-5.3-codex` with `medium` reasoning effort unless the user asks otherwise
- keep sub-agent tasks narrow, file-scoped where possible, and safe to run in parallel

## Privacy and decision guardrails

- the site is intentionally anonymous
- do not suggest linking personal social profiles, real names, or easy bridges to a professional identity
- if professional linkage is being considered, treat that as a privacy checkpoint before adding more cross-links or public repo references
- if the repo ever becomes private for privacy separation, prefer a static production setup that does not depend on a public GitHub Pages workflow

## Related tools

- `n8n` is the future automation layer for content pipelines and workflow automation
- Lighthouse CI is available through `lighthouse.yml` for manual live-site audits
