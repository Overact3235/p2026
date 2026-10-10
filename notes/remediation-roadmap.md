# Remediation Roadmap

- Version: 1.0.0
- Last updated: 2026-10-10
- Versioning rules: see D-010 in [`decisions.md`](../decisions.md)

This plan comes from a full repo scan done on 2026-10-10. It covers bugs, CI problems, outdated docs, and repo clutter found during the scan. Decisions behind this plan are logged in [`decisions.md`](../decisions.md).

## How this ships

- One concern per branch. Each branch is small enough to review in one sitting.
- Most work goes through `fix/` branches, and each merge to `main` cuts one patch release of the site (see D-002 and D-003).
- PR titles use a conventional prefix (`fix:`, `docs:`, `ci:`, `chore:`), because the squash-merge title is the commit semantic-release reads.
- Site release versions below are expected, not promised. They assume the PRs merge in this order and nothing else lands on `main` in between.
- Starting point: `main` at `v1.2.7`.
- Step status is one of `todo`, `in progress`, `done`, or `dropped`.

## Phase 0: Clear open branches

| Step | Branch | Site release | Status | Notes |
|---|---|---|---|---|
| 0.1 | `fix/remediation-roadmap` | v1.2.8 | in progress | This plan and the decisions log. |
| 0.2 | `feature/trim-agents-context` (PR #25) | v1.2.9 | todo | Merge after fixes listed in D-005. |
| 0.3 | `feature/mc26-transition` | none, or patch | todo | Open PR or delete. See D-009. |

Before PR #25 merges, fix on its branch:

- Build the repo-structure snapshot from `git ls-files` so ignored files like `.env` and `.astro/` never show up.
- Move "private" seed notes out of the public repo (gitignored folder or outside the repo).
- Remove the Codex-specific sub-agent section from `AGENTS.md`.
- Restore the "explain changes, not just make them" guidance.

## Phase 1: Site bugs

| Step | Branch | Site release | Status | Scope |
|---|---|---|---|---|
| 1.1 | `fix/blog-theme-vars` | v1.2.10 | todo | Replace undefined CSS variables (`--accent`, `--font-mono`, `--text-dim`, `--text-muted`) with the ones `global.css` defines. Make blog heading colours follow `[data-theme]` instead of `prefers-color-scheme`. |
| 1.2 | `fix/page-structure` | v1.2.11 | todo | Remove the nested `<main>` in `index.astro` and `about.astro`. Fix the home "Posts" count so it counts all posts, not the first five. |

## Phase 2: CI and dependencies

| Step | Branch | Site release | Status | Scope |
|---|---|---|---|---|
| 2.1 | `fix/lighthouse-assertions` | v1.2.12 | todo | Move score thresholds into `assert.assertions` in `lighthouserc.json`. The current `budgetFile` setup never checks scores. |
| 2.2 | `fix/release-workflow` | v1.2.13 | todo | Run semantic-release with pnpm, drop the `npm install --save-dev` step, use `fetch-depth: 0`, remove `package-lock.json`. Settle the `package.json` version (D-008). |
| 2.3 | `fix/astro-5-security` | v1.2.14 | todo | Bump `astro` and `@astrojs/mdx` to the latest 5.x releases. Re-run `pnpm audit` and note what remains. |

## Phase 3: Docs and cleanup

| Step | Branch | Site release | Status | Scope |
|---|---|---|---|---|
| 3.1 | `fix/docs-alignment` | v1.2.15 | todo | Update `AGENTS.md` and `README.md` to match the code: theme behaviour (after D-006), accent colours, fonts, repo structure, release workflow. Refresh `notes/session-handoff.md`. |
| 3.2 | `fix/repo-cleanup` | v1.2.16 | todo | Remove the `notes/*.zip` snapshots and the empty `notes/archive` file. Move `p2026/revamp_v9b/` under `notes/`. Add `.netlify/` to `.gitignore`. Remove commented-out steps in `deploy.yml`. |
| 3.3 | (no branch) | none | todo | Delete merged or abandoned remote branches. |

## Phase 4: Optional minor release

Only if D-006 goes toward changing the code:

| Step | Branch | Site release | Status | Scope |
|---|---|---|---|---|
| 4.1 | `feature/theme-system-preference` | v1.2.17 | todo | Dark by default, follow `prefers-color-scheme` when no choice is saved, keep the toggle. |
| 4.2 | (manual tag) | v1.3.0 | todo | Tag the end of remediation as a minor release, per the patch-lock strategy. The next automatic release after that is `v1.3.1`. |

If the theme stays as it is, the `v1.3.0` tag can still mark the end of remediation after Phase 3.

## Not in scope

- Astro 7 upgrade. Parked in the backlog as its own project (D-007).
- Linking `/timeline` from the nav. Waits on the existing roadmap question of what `/timeline` should become.
- Privacy wording changes on the home page and About page. These are content calls, not bugs.

## Changelog

- 1.0.0 (2026-10-10): First version. Phases 0 to 4 from the 2026-10-10 repo scan.
