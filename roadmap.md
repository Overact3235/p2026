# Roadmap

This file tracks follow-up ideas that came up during the March 22, 2026 context and layout review.

## Done

- Switch site fonts from Google Fonts to local bundled assets via `@fontsource`.
- Keep typography offline for better privacy, fewer external requests, and faster static delivery.

## Next up

- Reconcile the `timeline` and `projects` concepts.
  Right now the site has both `/timeline` and `/projects`, but the current implementation makes them overlap heavily. Decide whether `timeline` should stay as a distinct log, redirect to `projects`, or be removed entirely.

- Update project context docs to match the live Astro app.
  `AGENTS.md` still contains some older assumptions about timeline content and local `woff2` files. It should eventually reflect the actual content collections, route structure, and font implementation more precisely.

- Decide on the long-term permalink strategy.
  Because `p2026.xyz` is only being kept for a year, consider surfacing the repository URL more prominently as a durable reference:
  `https://github.com/Overact3235/p2026`

- Choose a hosting model based on workflow, not just simplicity.
  GitHub Pages is still the simplest production host, but Netlify may be a better fit if the project wants a `main` production branch plus a stable `staging` branch and preview deploys.

- Review footer and About page outbound links.
  Decide whether they should keep pointing to generic GitHub destinations or move to the repo permalink above.

## Validation notes

- Preferred local validation environment: Node 24 with `pnpm`.
- Typical flow:
  - `pnpm install`
  - `pnpm run dev`
  - `pnpm run build`
