# AGENTS.md — P2026 Project Context

This file exists to give AI assistants context about the project before making changes.

---

## What this is

P2026 is a personal tech hub and build log for 2026. It serves as a public-facing portfolio and writing outlet for someone learning web development and self-hosting while building out a broader personal infrastructure stack.

Live at: **p2026.xyz**

---

## Goals

- Document projects, launches, and experiments as they happen
- Build in public without disclosing specifics about the underlying infrastructure
- Develop web development skills hands-on — HTML, CSS, JavaScript, TypeScript
- Maintain a clean, fast, readable site that reflects technical taste

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro 5 | Zero JS by default, component model, content collections |
| Content | Markdown / MDX | Simple, portable, no CMS |
| Styling | Custom CSS | Global styles plus page-scoped Astro styles where it improves readability |
| Fonts | Local bundled fonts via `@fontsource` | No external requests, privacy, fast static delivery |
| Hosting | GitHub Pages | Free, fast, simple |
| CI/CD | GitHub Actions | Auto-deploy on push to main |
| Domain | p2026.xyz (Spaceship) | Apex domain, DNS via Spaceship |
| DNS / CDN | GitHub Pages CDN | No Cloudflare — keeping it simple |

---

## Repo structure

```
p2026/                          ← repo root
├── .github/
│   └── workflows/
│       ├── deploy.yml          ← auto-deploys on push to main
│       └── lighthouse.yml      ← manual Lighthouse audit against live site
├── prompts/
│   ├── blog_prompt.md          ← blog post drafting prompt
│   └── timeline_prompt.md      ← timeline/log drafting prompt
└── p2026/                      ← Astro project root
    ├── public/
    │   ├── CNAME               ← custom domain persistence
    │   ├── favicon.svg
    │   └── fonts/              ← self-hosted woff2 font files
    ├── src/
    │   ├── content/
    │   │   ├── blog/           ← blog posts (.md / .mdx)
    │   │   ├── projects/       ← project entries (.md)
    │   │   └── config.ts       ← Zod schemas for content collections
    │   ├── components/
    │   │   ├── Nav.astro
    │   │   └── Footer.astro
    │   ├── layouts/
    │   │   └── BaseLayout.astro
    │   ├── pages/
    │   │   ├── index.astro
    │   │   ├── blog/
    │   │   ├── timeline.astro
    │   │   ├── projects/
    │   │   ├── resources.astro
    │   │   └── about.astro
    │   └── styles/
    │       ├── global.css      ← all styling lives here
    │       └── fonts.css       ← local `@fontsource` font imports
    ├── astro.config.mjs        ← site: https://p2026.xyz, no base set
    ├── lighthouse-limits.json  ← Lighthouse score thresholds (90+ all categories)
    ├── lighthouserc.json       ← Lighthouse CI config, targets live site
    └── package.json
```

---

## Content model

### Blog posts (`src/content/blog/`)

```yaml
---
title: ""
description: ""   # one sentence, max 15 words, shown in post cards
pubDate: YYYY-MM-DD
tags: []          # 1-3 lowercase tags
project: ""       # optional, omit if not project-specific
draft: false      # omit or set true to hide from build
---
```

Target length: 600–1000 words (3–5 minute read).

### Projects (`src/content/projects/`)

```yaml
---
slug: ""
name: ""
description: ""
date: YYYY-MM-DD
status: shipped | building | archived
draft: false      # omit or set true to hide from build
link: ""          # optional live link
repo: ""          # optional source link
stack: []         # optional short stack list
---
```

Projects are the primary publishing anchor. Blog posts can link back to a project via its slug, and `/timeline` is generated from project dates plus blog post dates.

---

## Design

- **Aesthetic:** terminal-editorial dark. Amber accent (`#e8a020`). Minimal.
- **Dark mode:** default
- **Light mode:** automatic via `prefers-color-scheme: light`. Warm off-white bg, darker accent (`#8a4800`) for contrast compliance.
- **Fonts:** JetBrains Mono (headings, UI, code), Lora serif (body). Latin subset only.
- **Fonts are loaded locally** through `src/styles/fonts.css`, not from Google Fonts.

---

## Active notes

- The local font migration is complete and should be preserved.
- `/timeline` is generated from `projects` and `blog` content; there is no separate timeline collection right now.
- Other layout and infrastructure suggestions are intentionally deferred in `roadmap.md`.
- If you revisit timeline/projects structure, footer permalink strategy, or hosting decisions, check `roadmap.md` first.

---

## Deployment

- Push to `main` triggers `deploy.yml`
- Build: `npm run build` in `./p2026`
- Output: `./p2026/dist` uploaded as GitHub Pages artifact
- Node version: 24 (matches local dev)
- Squash merging only on PRs — keeps main history clean

---

## Git workflow

- Preferred branch prefixes are `feature/` for new work and `fix/` for bug fixes.
- Keep branch names short and descriptive, for example `feature/update-context` or `fix/nav-spacing`.
- Prefer many small, feature-scoped commits over one large branch-ending commit. Since PRs are squash-merged, each chat/work sequence should usually end with its own commit when the work is in a coherent state.
- Tool-specific prefixes added by external assistants are not part of the repo convention.

---

## What to keep in mind

- The site is intentionally anonymous — do not suggest linking to personal social profiles or real name
- Keep the site lightweight — no unnecessary dependencies, no heavy third-party scripts
- The author is learning web development — prefer explaining changes rather than just making them
- Content should sound like a person, not a content generator — avoid AI-ism language
- `astro.config.mjs` has no `base` set — the site runs at the apex domain. If reverting to github.io, uncomment `base: '/p2026'`

---

## Related tools

- **n8n** — self-hosted automation, used for content pipelines and workflow automation
- **Lighthouse CI** — manual audit workflow via `lighthouse.yml`, runs against live site
- Blog drafting prompt lives at `prompts/blog_prompt.md`
