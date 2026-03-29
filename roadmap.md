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
- Keep the branch flow simple: use `main` as the integration and production branch for now, and use a disposable preview branch for selective Netlify deploys.

## Soon

- Decide whether `/timeline` should become a distinct log, a redirect, or be retired.
- Improve project permalinks and outbound links so the repo stays a durable reference if the domain changes.
- Keep automation limited to drafting, PR creation, or content scaffolding rather than auto-publishing to production.
- Expand the lightweight interactive layer with plain JS where it genuinely improves navigation or usability.
- Revisit a true `develop` integration branch only if the site starts batching multiple concurrent changes often enough to justify it.

## Notes

- GitHub Pages remains the public production host for `main`.
- Netlify can be used for preview deploys without replacing the current production path.
- The current recommendation is to keep `main` as both integration and production, then selectively overwrite a `preview` branch when a stable Netlify test URL is useful.
- Prefer small, readable content and build tooling over adding dependencies.

## Branch Workflow

- `main` is the default branch and the production release branch.
- `main` also acts as the integration branch unless the project grows complex enough to justify a separate `develop` branch.
- `feature/*` branches stay short-lived and are squash-merged when ready.
- `preview` can be force-updated from a chosen feature branch when a stable Netlify deployment is useful for testing.
- A long-lived `develop` branch is deferred for now and should only be introduced if it solves a real coordination problem.
