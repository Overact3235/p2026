# Decisions

- Version: 1.3.0
- Last updated: 2026-11-01
- Versioning rules: see D-010

A running log of project decisions and the reasons behind them. New entries go at the bottom. When a decision changes, add a new entry that replaces the old one instead of rewriting history.

Statuses:

- **Accepted**: decided and in effect.
- **Proposed**: recommended, waiting on a yes or no.
- **Open**: needs a decision before the related work can start.
- **Replaced**: no longer in effect; points to the entry that replaced it.

---

## D-001: Git tags are the version of record

- Date: 2026-10-10
- Status: Proposed

**Context:** Releases are cut by semantic-release as `vX.Y.Z` tags and GitHub releases. The latest is `v1.2.7`. `package.json` still says `0.1.1` because nothing updates it.

**Decision:** The git tag is the site's version. `package.json` is not a source of truth for the version.

**Consequences:** Anyone checking "what version is live" looks at tags or GitHub releases. D-008 covers what to do with the `package.json` field.

---

## D-002: Keep the patch-lock release strategy

- Date: 2026-10-10
- Status: Accepted

**Context:** `release.config.js` forces every commit type to a patch bump. This entry records existing practice rather than a new choice. Patch-lock was picked (Strategy 1 in `notes/semantic-release-strategies.md`), and the GitHub Actions blog post describes it. Remediation work is mostly small fixes.

**Decision:** Keep patch-lock. Every merge to `main` makes a patch release. Minor and major versions are moved by hand with a tag (for example `git tag v1.3.0 && git push origin v1.3.0`), and the next automatic release continues from there.

**Consequences:** No change to `release.config.js`. Minor bumps are a deliberate milestone, not a side effect of a commit message. Docs-only merges also cut a patch release, which is accepted noise for now.

---

## D-003: Branch prefix shows the intended size of a change

- Date: 2026-10-10
- Status: Proposed

**Context:** The repo already uses `feature/` and `fix/` prefixes. With patch-lock, the prefix does not change the release number, but it still says how big a change is meant to be.

**Decision:** Use `fix/` branches for patch-sized work: bug fixes, docs, CI, and cleanup. Use `feature/` only for new user-facing behaviour that could justify a manual minor tag. Remediation work goes through `fix/` branches by default. PR titles use a conventional prefix (`fix:`, `docs:`, `ci:`, `chore:`, `feat:`) because the squash-merge title becomes the commit message.

**Consequences:** If patch-lock is ever replaced with standard semantic-release rules, conventional PR titles mean `feat:` would start making minor releases on its own without retraining habits.

---

## D-004: Ship remediation as small single-concern PRs

- Date: 2026-10-10
- Status: Proposed

**Context:** The 2026-10-10 scan found about 15 issues across CSS, markup, CI, dependencies, docs, and repo hygiene.

**Decision:** Split the work into the phases and branches in `notes/remediation-roadmap.md`, one concern per branch, instead of one large cleanup branch.

**Consequences:** More PRs and more patch releases, but each one is easy to review, easy to revert, and maps to one line in the release notes.

---

## D-005: Merge PR #25 after fixes

- Date: 2026-10-10
- Status: Proposed

**Context:** PR #25 (`feature/trim-agents-context`) shortens `AGENTS.md` and adds a repo-structure snapshot script and a publishing workflow note. A review found:

1. The snapshot script walks the filesystem, so it lists ignored and untracked files such as `.env` and `.astro/`.
2. The publishing note suggests keeping private seed notes inside this public repo.
3. It adds a Codex-specific sub-agent section to a file shared by all tools.
4. The trim dropped the "explain changes, not just make them" guidance.

**Decision:** Fix those four points on the PR branch, then squash-merge. The theme description in `AGENTS.md` gets fixed later in `fix/docs-alignment`, after D-006.

**Consequences:** Phase 3 docs work edits the shorter `AGENTS.md` and avoids merge conflicts with an open PR.

---

## D-006: Theme default

- Date: 2026-10-10
- Status: Open

**Context:** `AGENTS.md` says the site is dark by default and switches to light through `prefers-color-scheme`. The code is light by default, ignores the system preference, and only goes dark through the toggle.

**Options:**

- Change the code to match the docs: dark default, follow the system preference, keep the toggle. This is a visible change and fits a `feature/` branch.
- Change the docs to match the code: light default, toggle only.

**Decision:** Not made yet.

**Consequences:** Blocks the theme wording in `fix/docs-alignment`. Does not block `fix/blog-theme-vars`, which only makes blog headings follow whichever theme is active.

---

## D-007: Stay on Astro 5 for now

- Date: 2026-10-10
- Status: Replaced by D-012

**Context:** `pnpm audit` reports 56 advisories, including a critical one in Astro image optimisation. The site is static and does not use the image pipeline, so the real exposure is limited to build time. Astro 7 is available but is two major versions ahead.

**Decision:** Bump to the latest Astro 5.x patch release as part of remediation. Treat Astro 7 as a separate project in the backlog.

**Consequences:** Some advisories may remain until the major upgrade. The remaining list should be recorded in the PR that does the bump. The Astro 7 upgrade itself is scheduled as Phase 5 of the remediation roadmap (D-011).

---

## D-008: pnpm is the only package manager

- Date: 2026-10-10
- Status: Proposed

**Context:** The deploy workflow and Netlify use pnpm with `pnpm-lock.yaml`. Netlify gets pnpm from the `packageManager` field in `package.json`. The release workflow uses npm with a separate `package-lock.json` and installs semantic-release on every run, which edits `package.json` and `package-lock.json` on the CI runner. Those edits are thrown away when the job ends, so nothing is committed back. `package-lock.json` was committed once, on 2026-03-07, in the same commit that switched the build to pnpm. Nothing regenerates it. The only thing that reads it is the npm cache step in `release.yml`. Local builds and agent preview builds don't need it.

**Decision:** Use pnpm everywhere. Remove `package-lock.json`. Run semantic-release through pnpm. Set the `package.json` version to `0.0.0-semantic-release` so nobody mistakes it for the real version (see D-001).

**Consequences:** One lockfile and one install path. Local and CI installs match.

---

## D-009: `feature/mc26-transition` branch

- Date: 2026-10-10
- Status: Accepted

**Context:** The remote branch holds one commit from 2026-04-05 that adds a placeholder note, `notes/minecraft-mc26-transition.md`. The commit author is git's placeholder identity (`Your Name <you@example.com>`), so that machine had no git name or email set.

**Options:**

- Reword the commit with the right author, open a PR, and merge it as a parked note.
- Delete the branch if the idea is no longer active.

**Decision:** Keep it. Reword the commit with the right author, open a PR, and merge the note. The note is the starting point for the site's first article. Home lab posts come later and get their own discussion.

**Consequences:** Whichever machine made that commit needs `git config user.name` and `user.email` set before it commits again. The note was reviewed for publishing on 2026-10-10. The server domain was removed, the plan was resized for a 2 vCPU / 4 GB VPS, and the TCPShield and CrowdSec setup stays in as a recommendation for future architectures.

---

## D-010: Planning docs carry their own semantic version

- Date: 2026-10-10
- Status: Accepted

**Context:** `decisions.md` and `notes/remediation-roadmap.md` will change often as work moves forward. Git history shows every edit, but not which edits matter.

**Decision:** Each of these files has a `Version` line at the top and a `Changelog` section at the bottom. Every change bumps the version and adds one changelog line. Most changes are patch bumps.

For `decisions.md`:

- Patch: status changes (for example Proposed to Accepted), wording fixes, added context or consequences.
- Minor: a new decision entry, or an entry replaced by a new one.
- Major: the format or status scheme changes.

For `notes/remediation-roadmap.md`:

- Patch: step status updates, expected site versions updated, scope wording.
- Minor: a step or phase added, removed, or reordered.
- Major: the plan is replaced or restructured.

Doc versions are labels inside the files, not git tags. Git tags stay reserved for site releases (D-001), so the two version lines never collide.

**Consequences:** Anyone reading a planning doc can see how current it is and what changed without reading the git log. Edits take one extra line.

---

## D-011: Astro 7 and EmDash as a remediation sub-epic

- Date: 2026-10-10
- Status: Accepted

**Context:** D-007 keeps remediation on Astro 5 and parks Astro 7 as its own project. The author wants that project tracked now, with two additions: measure whether Astro 7 changes performance, and decide whether EmDash, Cloudflare's Astro-based CMS, is useful for future publishing.

**Decision:** Add Phase 5 to `notes/remediation-roadmap.md`, after Phase 3: take a performance baseline, upgrade from Astro 5 to 7, compare, then evaluate EmDash. Only the write-up from the EmDash evaluation gets merged. Any trial setup stays on a throwaway branch.

**Consequences:** D-007 still holds for Phases 0 to 4. The EmDash evaluation has to weigh its database-backed content against the Git and Markdown source of truth in `tasks.md` Epic 2, and its server runtime against the current static hosting.

---

## D-012: Upgrade to Astro 7 instead of patching Astro 5

- Date: 2026-10-31
- Status: Accepted
- Replaces: D-007

**Context:** The October 2026 security update (`notes/updates/2026-10-security-update.md`) found 63 advisories, up from 56. Of the 12 in `astro` itself, only one (low) is fixed on the 5.x line. The rest are fixed only in Astro 6 or 7, and the critical one only in 7.2.8 or later. The latest release is Astro 7.4.4. The site's real exposure is low, because it is fully static and uses none of the affected features, but staying on Astro 5 means those advisories never clear.

**Decision:** Drop the plan to bump within Astro 5 (roadmap step 2.3). Upgrade `astro` to 7.x and `@astrojs/mdx` to 8.x as the next site change after the October security update merges. The Astro 5 baseline in the October update is the "before" for the speed and size comparison.

**Consequences:** The upgrade lands before the Phase 1 to 3 fixes, so those are built and tested on Astro 7. The EmDash evaluation (5.3) can follow the upgrade without waiting for Phase 3. D-011 still holds, with the upgrade moved earlier.

---

## D-013: `v1.3.0` marks the Astro 7 upgrade

- Date: 2026-11-01
- Status: Accepted

**Context:** The Astro 7 upgrade (PR #31) moved the site across two major Astro versions, but under patch-lock (D-002) it released as `v1.2.12`. The roadmap had reserved `v1.3.0` for the end of remediation (step 4.2).

**Decision:** Tag the Astro 7 commit (`425eef8`) as `v1.3.0`, alongside `v1.2.12`, with release notes describing the upgrade. The end-of-remediation tag moves to `v1.4.0`.

**Consequences:** Automatic releases continue from `v1.3.x`; the first one was `v1.3.1` (PR #32). A minor tag goes on a change only after it has merged and released, so the tag never runs ahead of the code it describes.

---

## Changelog

- 1.3.0 (2026-11-01): Added D-013 (`v1.3.0` marks Astro 7, end of remediation moves to `v1.4.0`).
- 1.2.0 (2026-10-31): Added D-012 (upgrade to Astro 7). D-007 replaced by it.
- 1.1.1 (2026-10-10): D-009 records the publishing review of the mc26 note.
- 1.1.0 (2026-10-10): Added D-011 (Astro 7 and EmDash sub-epic). D-007 points to it.
- 1.0.1 (2026-10-10): D-009 accepted (keep the branch, the note becomes the first article). Added where `package-lock.json` came from and what reads it to D-008.
- 1.0.0 (2026-10-10): First version. D-001 to D-010 from the 2026-10-10 repo scan.
