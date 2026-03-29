# Session Handoff

Last updated: 2026-03-28

## Current branch workflow

- `main` is the default branch, integration branch, and production release branch.
- GitHub Pages on `main` continues to serve `p2026.xyz`.
- `preview` is the disposable Netlify branch for selective deployment testing.
- `feature/*` branches stay short-lived and should be squash-merged when ready.
- A long-lived `develop` branch is deferred for now.

## Branches already pushed

- `feature/add-to-backlog`
- `feature/netlify-staging-setup`
- `preview`
- `main`

## Suggested next steps

1. Merge `feature/add-to-backlog` first.
2. Review `feature/netlify-staging-setup` after that, since it now matches the `preview` branch model.
3. In Netlify, keep the site connected to `main` and enable branch deploys for `preview`.
4. Use `preview` only when a stable test URL is useful; otherwise rely on PR previews.

## Notes

- The old `develop` branch was renamed to `preview` on the remote.
- Codex chat history should not be treated as shared across machines; use repo notes and pushed branches as the source of truth.
