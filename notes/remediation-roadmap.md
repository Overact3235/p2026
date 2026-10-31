# Remediation Roadmap

- Version: 1.2.0
- Last updated: 2026-10-31
- Versioning rules: see D-010 in [`decisions.md`](../decisions.md)

This plan comes from a full repo scan done on 2026-10-10. It covers bugs, CI problems, outdated docs, and repo clutter found during the scan. Decisions behind this plan are logged in [`decisions.md`](../decisions.md).

## How this ships

- One concern per branch. Each branch is small enough to review in one sitting.
- Most work goes through `fix/` branches, and each merge to `main` cuts one patch release of the site (see D-002 and D-003).
- PR titles use a conventional prefix (`fix:`, `docs:`, `ci:`, `chore:`), because the squash-merge title is the commit semantic-release reads.
- Site release versions below are expected, not promised. They assume the PRs merge in this order and nothing else lands on `main` in between. Since 1.2.0 the order is: 0.1, then 5.1 and 5.2 (Astro 7, D-012), then the rest of Phase 0 and Phases 1 to 4.
- Starting point: `main` at `v1.2.8`. The plan started at `v1.2.7`. PR #27 (`fix/no-ai-attribution`, AI attribution off and auto-filled PR descriptions) merged first, outside the plan, and released `v1.2.8`.
- Step status is one of `todo`, `in progress`, `done`, or `dropped`.

## For the session running this plan

From 2026-10-10 on, this plan runs in a remote Claude Code session, not on the machine that did the scan. The author chats and approves from there. What that means:

- The session's container is temporary. Commit and push each step's branch before stopping, or the work is lost.
- The container starts from a fresh clone. Run `git fetch origin` before starting a step so local `main` and branch refs are current.
- `gh` is not installed there. PRs, reviews, and CI checks go through the GitHub integration instead.
- Git identity was checked in that session on 2026-10-10: `Overact3235` with the GitHub noreply email. Check it again if the session moves to a new environment.
- `pnpm install --frozen-lockfile` and `pnpm run build` in `p2026/` both work there (checked 2026-10-10).
- Each step uses the branch named in its row. The session may start on a default branch of its own (for example `feat/p2026-main`). Don't do plan work on that branch, because the plan spans many branches.

- Read `AGENTS.md`, this file, and `decisions.md` before starting a step.
- Check `git config user.name` and `git config user.email` on the machine first. A missing identity is how D-009's placeholder author happened.
- Start each step from an up-to-date `main`. Run `pnpm run build` in `p2026/` before opening the PR.
- Do not start a step that depends on an Open decision. Ask instead. D-006 (theme default) blocks two things: the theme sentences in 3.1, because the docs should describe the theme the site will actually ship, and all of Phase 4, which only happens if the theme code changes. The rest of 3.1 can go ahead.
- Do not merge PRs, push to `main`, or delete remote branches without the author's go-ahead.
- After each step, update its Status here and bump this file's version per D-010. Same for `decisions.md` when a status changes.

## Phase 0: Clear open branches

| Step | Branch | Site release | Status | Notes |
|---|---|---|---|---|
| 0.1 | `fix/remediation-roadmap` | v1.2.9 | in progress | This plan and the decisions log. |
| 0.2 | `feature/trim-agents-context` (PR #25) | v1.2.12 | todo | Merge after fixes listed in D-005. |
| 0.3 | `feature/mc26-transition` | patch | todo | Keep. Fix the placeholder author, then open a PR. The note becomes the first article (D-009). |

Before PR #25 merges, fix on its branch:

- Build the repo-structure snapshot from `git ls-files` so ignored files like `.env` and `.astro/` never show up.
- Move "private" seed notes out of the public repo (gitignored folder or outside the repo).
- Remove the Codex-specific sub-agent section from `AGENTS.md`.
- Restore the "explain changes, not just make them" guidance.

## Phase 1: Site bugs

| Step | Branch | Site release | Status | Scope |
|---|---|---|---|---|
| 1.1 | `fix/blog-theme-vars` | v1.2.13 | todo | Replace undefined CSS variables (`--accent`, `--font-mono`, `--text-dim`, `--text-muted`) with the ones `global.css` defines. Make blog heading colours follow `[data-theme]` instead of `prefers-color-scheme`. |
| 1.2 | `fix/page-structure` | v1.2.14 | todo | Remove the nested `<main>` in `index.astro` and `about.astro`. Fix the home "Posts" count so it counts all posts, not the first five. |

## Phase 2: CI and dependencies

| Step | Branch | Site release | Status | Scope |
|---|---|---|---|---|
| 2.1 | `fix/lighthouse-assertions` | v1.2.15 | todo | Move score thresholds into `assert.assertions` in `lighthouserc.json`. The current `budgetFile` setup never checks scores. |
| 2.2 | `fix/release-workflow` | v1.2.16 | todo | Run semantic-release with pnpm, drop the `npm install --save-dev` step, use `fetch-depth: 0`, remove `package-lock.json`. Settle the `package.json` version (D-008). |
| 2.3 | `fix/astro-5-security` | none | dropped | Was: bump to the latest Astro 5.x. Dropped because 5.x only fixes one low advisory (D-012). Replaced by 5.2. |

## Phase 3: Docs and cleanup

| Step | Branch | Site release | Status | Scope |
|---|---|---|---|---|
| 3.1 | `fix/docs-alignment` | v1.2.17 | todo | Update `AGENTS.md` and `README.md` to match the code: theme behaviour (after D-006), accent colours, fonts, repo structure, release workflow. Refresh `notes/session-handoff.md`. |
| 3.2 | `fix/repo-cleanup` | v1.2.18 | todo | Remove the `notes/*.zip` snapshots and the empty `notes/archive` file. Move `p2026/revamp_v9b/` under `notes/`. Add `.netlify/` to `.gitignore`. Remove commented-out steps in `deploy.yml`. |
| 3.3 | (no branch) | none | todo | Delete merged or abandoned remote branches. |

## Phase 4: Optional minor release

Only if D-006 goes toward changing the code:

| Step | Branch | Site release | Status | Scope |
|---|---|---|---|---|
| 4.1 | `feature/theme-system-preference` | v1.2.19 | todo | Dark by default, follow `prefers-color-scheme` when no choice is saved, keep the toggle. |
| 4.2 | (manual tag) | v1.3.0 | todo | Tag the end of remediation as a minor release, per the patch-lock strategy. The next automatic release after that is `v1.3.1`. |

If the theme stays as it is, the `v1.3.0` tag can still mark the end of remediation after Phase 3.

## Phase 5: Astro 7 and EmDash (sub-epic)

A separate sub-epic (D-011). Since D-012, steps 5.1 and 5.2 come right after 0.1, ahead of the other phases. 5.3 follows 5.2. None of it depends on D-006.

| Step | Branch | Site release | Status | Scope |
|---|---|---|---|---|
| 5.1 | `fix/october-security-update` | v1.2.10 | in progress | October 2026 security update: Astro version check, advisories, and the Astro 5 performance baseline (build time, `dist/` size, page weight). Saved in `notes/updates/2026-10-security-update.md`. Lighthouse scores get added with the 5.2 comparison. |
| 5.2 | `feature/astro-7-upgrade` | v1.2.11 | todo | Upgrade `astro` to 7.x and `@astrojs/mdx` to 8.x, following the v6 and v7 upgrade guides in order. Re-run the 5.1 measurements and `pnpm audit`, check the Netlify deploy preview, and add the before and after numbers to the October update and the PR. |
| 5.3 | `fix/emdash-evaluation` | patch | todo | Evaluate EmDash (Cloudflare's Astro-based CMS) for future publishing. Try it on a throwaway branch that never merges. Merge only the write-up, `notes/emdash-evaluation.md`. |

Questions the EmDash write-up must answer:

- Content source: EmDash stores content in a database (D1 or SQLite). Can posts still end up as Markdown in Git, which `tasks.md` Epic 2 keeps as the source of truth?
- Hosting: EmDash runs on Cloudflare Workers or a Node server. What happens to the static GitHub Pages and Netlify setup?
- Cost: which features need a paid Cloudflare plan (for example the plugin sandbox)?
- Astro version: which Astro version does it need? This is why 5.3 comes after 5.2.
- Authoring: is it better for this site than the plain file workflow, Front Matter CMS, or Pages CMS?
- Verdict: adopt, revisit later, or drop.

## Not in scope

- Linking `/timeline` from the nav. Waits on the existing roadmap question of what `/timeline` should become.
- Privacy wording changes on the home page and About page. These are content calls, not bugs.

## Changelog

- 1.2.0 (2026-10-31): Astro 7 moves ahead of Phases 1 to 4 (D-012). Step 2.3 dropped. Step 5.1 is now the October security update. Expected site versions updated.
- 1.1.1 (2026-10-11): PR #27 released `v1.2.8` outside the plan, so every expected site version moves up by one.
- 1.1.0 (2026-10-10): Added Phase 5, the Astro 7 upgrade with a performance comparison and an EmDash evaluation (D-011).
- 1.0.2 (2026-10-10): Step 0.3 set to keep (D-009). Clarified what D-006 blocks. Each step uses its own branch, not the session's default branch.
- 1.0.1 (2026-10-10): Work moves to a remote Claude Code session. Added how that session works, and recorded the identity and build checks.
- 1.0.0 (2026-10-10): First version. Phases 0 to 4 from the 2026-10-10 repo scan.
