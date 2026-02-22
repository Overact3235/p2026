# Project 2026 - P2026

Personal hub for 2026 — project log, blog, and launch tracker.

Built with [Astro](https://astro.build) and deployed on [GitHub Pages](https://pages.github.com). No CMS, no database, just files.

→ [p2026.xyz](https://p2026.xyz)

---

## Running locally

```bash
npm install
npm run dev       # localhost:4321
npm run build     # production build
```

## Adding content

**Blog post** — create a `.md` file in `src/content/blog/`:
```yaml
---
title: "Post title"
description: "One sentence summary."
pubDate: 2026-02-01
tags: ["tag1", "tag2"]
project: "optional-project-name"
---

Content here.
```

**Timeline entry** — create a `.md` file in `src/content/timeline/`:
```yaml
---
title: "Launched something"
date: 2026-02-01
type: launch    # launch | milestone | post | update | note
project: "myapp"
link: "https://..."
---
```

**Resources** — edit the array in `src/pages/resources.astro`

**Projects** — edit the array in `src/pages/about.astro`

## Deployment

Pushes to `main` auto-deploy via GitHub Actions. To set up:

1. Go to **Settings → Pages**
2. Set source to **GitHub Actions**
3. Push to `main`

## Structure

```
src/
├── content/
│   ├── blog/
│   └── timeline/
├── components/
│   ├── Nav.astro
│   └── Footer.astro
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro
│   ├── blog/
│   ├── timeline.astro
│   ├── resources.astro
│   └── about.astro
└── styles/
    └── global.css
```