# Decisions

- Version: 1.0.1
- Last updated: 2026-10-10
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
- Status: Proposed

**Context:** `pnpm audit` reports 56 advisories, including a critical one in Astro image optimisation. The site is static and does not use the image pipeline, so the real exposure is limited to build time. Astro 7 is available but is two major versions ahead.

**Decision:** Bump to the latest Astro 5.x patch release as part of remediation. Treat Astro 7 as a separate project in the backlog.

**Consequences:** Some advisories may remain until the major upgrade. The remaining list should be recorded in the PR that does the bump.

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

**Consequences:** Whichever machine made that commit needs `git config user.name` and `user.email` set before it commits again. Before the note becomes a public post, review what it shares: it names the public server endpoint, the VPS size, and the protection setup (TCPShield, CrowdSec, firewall approach).

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

## Changelog

- 1.0.1 (2026-10-10): D-009 accepted (keep the branch, the note becomes the first article). Added where `package-lock.json` came from and what reads it to D-008.
- 1.0.0 (2026-10-10): First version. D-001 to D-010 from the 2026-10-10 repo scan.
