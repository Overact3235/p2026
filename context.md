# CLAUDE.md — P2026 Project Context

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
| Styling | Custom CSS | Single `global.css`, no framework |
| Fonts | Local woff2 | No external requests, privacy |
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
│   └── blog-post.md            ← master prompt for generating blog posts
└── p2026/                      ← Astro project root
    ├── public/
    │   ├── CNAME               ← custom domain persistence
    │   ├── favicon.svg
    │   └── fonts/              ← self-hosted woff2 font files
    ├── src/
    │   ├── content/
    │   │   ├── blog/           ← blog posts (.md / .mdx)
    │   │   ├── timeline/       ← log entries (.md)
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
    │   │   ├── resources.astro
    │   │   └── about.astro
    │   └── styles/
    │       ├── global.css      ← all styling lives here
    │       └── fonts.css       ← @font-face declarations for local fonts
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

### Timeline entries (`src/content/timeline/`)

```yaml
---
title: ""
date: YYYY-MM-DD
type: launch | milestone | post | update | note
project: ""       # optional
link: ""          # optional
---
```

Timeline is a manual log — nothing auto-generates it. Add an entry for significant events, launches, and milestones. Not every timeline entry needs a blog post, but most blog posts should have a corresponding timeline entry.

---

## Design

- **Aesthetic:** terminal-editorial dark. Amber accent (`#e8a020`). Minimal.
- **Dark mode:** default
- **Light mode:** automatic via `prefers-color-scheme: light`. Warm off-white bg, darker accent (`#8a4800`) for contrast compliance.
- **Fonts:** JetBrains Mono (headings, UI, code), Lora serif (body). Latin subset only.
- **No JavaScript** shipped to the browser. CSS-only light mode toggle.

---

## Deployment

- Push to `main` triggers `deploy.yml`
- Build: `npm run build` in `./p2026`
- Output: `./p2026/dist` uploaded as GitHub Pages artifact
- Node version: 24 (matches local dev)
- Squash merging only on PRs — keeps main history clean

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
- Blog post generation prompt lives at `prompts/blog-post.md`