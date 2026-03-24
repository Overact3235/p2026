# Roadmap

## Done

- Local bundled fonts are in place.
- The site already has a clean Astro base, project collection, blog collection, and GitHub Actions deploy flow.
- Lightweight interactions have started: project status filters and heading copy-links are now part of the static-first UI.

## Next

- Make `projects` the primary publishing trigger and keep AI-assisted content draft-first.
- Add a real project/blog workflow for launch notes, writeups, and follow-up posts.
- Fix the content model and docs so they describe the live site instead of older timeline assumptions.
- Add lightweight validation helpers for SEO and performance so checks are repeatable.
- Ship the missing RSS/feed and metadata basics before adding more automation.

## Soon

- Decide whether `/timeline` should become a distinct log, a redirect, or be retired.
- Improve project permalinks and outbound links so the repo stays a durable reference if the domain changes.
- Keep automation limited to drafting, PR creation, or content scaffolding rather than auto-publishing to production.
- Expand the lightweight interactive layer with plain JS where it genuinely improves navigation or usability.

## Notes

- GitHub Pages remains the default host unless workflow needs push us elsewhere.
- Prefer small, readable content and build tooling over adding dependencies.
