# P2026 — Project 2026 Site

Personal tech hub and blog. Built with [Astro](https://astro.build), deployed on [GitHub Pages](https://pages.github.com).

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (localhost:4321)
npm run dev

# Build for production
npm run build
```

## Before you deploy

1. **`astro.config.mjs`** — replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.
   If your repo name is NOT `<username>.github.io`, uncomment the `base` line and set it to your repo name (e.g. `base: '/p2026'`).

2. **`src/components/Footer.astro`** — update the GitHub link.

3. **`src/pages/about.astro`** — fill in your info.

## GitHub Pages Setup

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under *Source*, select **GitHub Actions**.
4. Push to `main` — the workflow in `.github/workflows/deploy.yml` will handle the rest.

## Adding content

### Blog post
Create a `.md` file in `src/content/blog/`:

```yaml
---
title: "Your Post Title"
description: "One sentence summary."
pubDate: 2026-02-01
tags: ["tag1", "tag2"]
project: "optional-project-name"  # optional
---

Your content here in markdown.
```

### Timeline entry
Create a `.md` file in `src/content/timeline/`:

```yaml
---
title: "Launched something cool"
date: 2026-02-01
type: launch         # launch | milestone | post | update | note
project: "myapp"     # optional
link: "https://..."  # optional
---
```

### Resources
Edit the `resources` array directly in `src/pages/resources.astro`.

### Projects (About page)
Edit the `projects` array in `src/pages/about.astro`.

## Structure

```
src/
├── content/
│   ├── blog/        ← blog posts (.md / .mdx)
│   └── timeline/    ← log entries (.md)
├── layouts/
│   └── BaseLayout.astro
├── components/
│   ├── Nav.astro
│   └── Footer.astro
├── pages/
│   ├── index.astro
│   ├── blog/
│   ├── timeline.astro
│   ├── resources.astro
│   └── about.astro
└── styles/
    └── global.css   ← all styling lives here
```
