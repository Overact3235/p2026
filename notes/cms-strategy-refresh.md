# CMS Strategy Refresh

Last updated: 2026-04-04

## Summary

The most interesting new CMS option to watch is **EmDash by Cloudflare**, not "MDocs" based on the official sources checked during this review.

EmDash looks promising for future use because it is:

- Astro-powered on the frontend
- open source and MIT licensed
- designed as a modern CMS with a real admin interface
- deployable to Cloudflare accounts and Node.js environments
- still very early as a `v0.1.0` preview

For **P2026 right now**, it still looks like a **future evaluation**, not an immediate integration target.

## Why it is interesting

Cloudflare describes EmDash as a new CMS powered by Astro themes, pages, layouts, components, styles, and a seed file for content types. That makes it much closer to this repo's current frontend model than a traditional PHP CMS.

The official EmDash repository also says it can run on Cloudflare or on any Node.js server with SQLite, which makes it more portable than a Cloudflare-only product pitch might suggest.

This is the strongest reason to keep it on the radar:

- the site already uses Astro content collections
- the project values lightweight content workflows
- the site is content-driven and editorial in nature
- Astro-native theming lowers the conceptual jump compared with a full platform change

## Why it is not the right move yet

P2026 is still a small static site with a file-first workflow and GitHub Pages in production. EmDash is not just a tiny editing layer on top of Markdown files. It is a broader CMS platform with its own operational model.

That means adopting it would likely be more than "add a CMS":

- it would shift the site from a static file-first workflow toward a full CMS runtime
- it would add a real admin/backend surface to maintain
- it would move the project away from the current "just files and builds" simplicity
- it would be harder to justify before the content workflow itself feels constrained
- the fully sandboxed plugin story currently depends on Dynamic Workers, which the repo documents as requiring a paid Cloudflare account unless that feature is disabled

## Recommendation

Treat EmDash as a **future-facing CMS candidate** and not as the current default plan.

The better short-term move is still:

- keep Markdown and Astro content collections as the source of truth
- improve the publishing workflow first
- keep Netlify for preview infrastructure only
- revisit a CMS after there is enough authoring friction to justify one

## Good triggers for revisiting later

Re-evaluate EmDash if one or more of these become true:

- writing directly in files starts slowing publishing down
- a browser-based editorial workflow becomes important
- the site needs richer drafts, review states, or editorial metadata
- production hosting is no longer tied closely to GitHub Pages
- the project is comfortable moving beyond a pure static publishing flow

## Sources checked

- [Introducing EmDash - Cloudflare Blog](https://blog.cloudflare.com/emdash-wordpress/)
- [EmDash GitHub repository](https://github.com/emdash-cms/emdash)
- [Astro on Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Cloudflare acquires Astro press release](https://www.cloudflare.com/press/press-releases/2026/cloudflare-acquires-astro-to-accelerate-the-future-of-high-performance-web-development/)
