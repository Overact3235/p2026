# Roadmap

## Done

- Local bundled fonts are in place.
- The site already has a clean Astro base, project collection, blog collection, and GitHub Actions deploy flow.
- Lightweight interactions have started: project status filters and heading copy-links are now part of the static-first UI.

## Next

- Ship publishing workflow v1 so project updates can reliably turn into draft blog posts and stable project pages.
- Evaluate whether the site even needs a CMS before adding one, and keep Git plus Markdown as the source of truth either way.
- Add lightweight validation helpers for SEO and performance so checks are repeatable.
- Add a small planning layer: `roadmap.md` for direction, `tasks.md` for active work, and `backlog/` for parked ideas.
- Define a `develop` branch plus Netlify preview flow so staged work can be reviewed live without changing production hosting.

## Soon

- Decide whether `/timeline` should become a distinct log, a redirect, or be retired.
- Improve project permalinks and outbound links so the repo stays a durable reference if the domain changes.
- Keep automation limited to drafting, PR creation, or content scaffolding rather than auto-publishing to production.
- Expand the lightweight interactive layer with plain JS where it genuinely improves navigation or usability.
- Decide whether Netlify stays preview-only or becomes part of a longer-term multi-environment workflow.

## Notes

- GitHub Pages remains the public production host for `main`.
- Netlify can be added as a preview and staging host for `develop` without replacing the current production path.
- Prefer small, readable content and build tooling over adding dependencies.
