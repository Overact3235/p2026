# Project 2026 - P2026

Personal hub for 2026: project log, blog, and launch tracker.

Built with [Astro](https://astro.build) and deployed on [GitHub Pages](https://pages.github.com). No CMS, no database, just files.

-> [p2026.xyz](https://p2026.xyz)

---

## Running locally

```bash
pnpm install
pnpm run dev
pnpm run build
```

## Adding content

**Blog post** - create a `.md` file in `src/content/blog/`:

```yaml
---
title: "Post title"
description: "One sentence summary."
pubDate: 2026-02-01
tags: ["tag1", "tag2"]
project: "optional-project-slug"
draft: true
---

Content here.
```

**Project** - create a `.md` file in `src/content/projects/`:

```yaml
---
slug: "project-slug"
name: "Project name"
description: "One sentence summary."
date: 2026-02-01
status: shipped
link: "https://..."
repo: "https://github.com/..."
stack: ["Astro", "GitHub Actions"]
---

Short project notes here.
```

**Timeline** - `/timeline` is generated from projects and blog posts. There is no separate timeline content folder.

**Resources** - edit the array in `src/pages/resources.astro`

## Deployment

Pushes to `main` auto-deploy via GitHub Actions. To set up:

1. Go to **Settings -> Pages**
2. Set source to **GitHub Actions**
3. Push to `main`

## Branch naming

Use `feature/` for new work and `fix/` for bug fixes.

Examples:

- `feature/update-context`
- `fix/mobile-nav-spacing`

## Structure

```text
src/
|-- content/
|   |-- blog/
|   `-- projects/
|-- components/
|   |-- Footer.astro
|   `-- Nav.astro
|-- layouts/
|   |-- BaseLayout.astro
|   `-- BlogLayout.astro
|-- pages/
|   |-- about.astro
|   |-- blog/
|   |-- index.astro
|   |-- projects/
|   |-- resources.astro
|   `-- timeline.astro
`-- styles/
    `-- global.css
```
