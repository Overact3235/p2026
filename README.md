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
featured: false
link: "https://..."
repo: "https://github.com/..."
stack: ["Astro", "GitHub Actions"]
---

Short project notes here.
```

**Timeline** - `/timeline` is generated from projects and blog posts. There is no separate timeline content folder.

**Resources** - edit the array in `src/pages/resources.astro`

## Deployment

### Production

Pushes to `main` auto-deploy to GitHub Pages. To set up:

1. Go to **Settings -> Pages**
2. Set source to **GitHub Actions**
3. Push to `main`

### Preview and staging

The repo also supports a lightweight preview flow with Netlify:

- `main` stays the integration branch and public production branch on GitHub Pages
- Netlify can still build `main` without becoming the public production host
- `preview` is the disposable Netlify branch deploy for a stable test URL when needed
- Netlify should be treated as a preview host, not the public production site
- Feature branches can use Netlify branch deploys or PR deploy previews

The root `netlify.toml` is configured for this repo's nested Astro app:

- Base directory: `p2026`
- Build command: `pnpm run build`
- Publish directory: `dist`
- Node version: `24`

To connect Netlify:

1. Import the GitHub repo into Netlify
2. Let Netlify read `netlify.toml`
3. Keep Netlify connected to `main`
4. Enable branch deploys for `preview`
5. Keep GitHub Pages serving `main` and `p2026.xyz` as the public production site

If you want a stable preview URL, update `preview` with the branch you want to review and let Netlify rebuild. For one-off previews, Netlify PR deploys can still be enough without touching `preview`.

## Branch naming

Use `feature/` for new work and `fix/` for bug fixes.

Examples:

- `feature/update-context`
- `fix/mobile-nav-spacing`

Use `main` as the default integration and production branch. Use `preview` only when you want a stable Netlify deployment for a selected change.

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
