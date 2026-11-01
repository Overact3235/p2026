# Astro 5 to 7: Performance

- Date: 2026-11-01
- Change: `astro` 5.17.3 to 7.4.4, `@astrojs/mdx` 4.3.13 to 8.1.2 (roadmap step 5.2, D-012)
- Related: the security side and the Astro 5 baseline are in [`2026-10-security-update.md`](2026-10-security-update.md)

What the upgrade changed for speed and size, measured on this site. Short version: **builds are about a third faster, the pages visitors download are about the same, and the dev server got slower to start** when run by an agent.

## What changed under the hood

From Astro's release posts (see Sources):

- **Astro 6** (2026-03): a redesigned dev server that runs the same code paths as production (Vite's Environment API), and rendering performance work.
- **Astro 7** (2026-06):
  - Vite 8, with Rolldown, a Rust-based bundler that replaces both esbuild and Rollup.
  - The `.astro` compiler rewritten in Rust.
  - Markdown and MDX rendered by Sätteri, a new native pipeline, instead of remark and rehype.
  - A queue-based rendering engine.
  - Astro reports 15–61% faster builds on its own benchmarks.

## Results on this site

Same machine for every run. Builds start from a clean state (`dist/`, `.astro/` and the Vite cache removed).

### Builds

| Measure | Astro 5.17.3 | Astro 7.4.4 | Change |
|---|---|---|---|
| Astro's own build timer | 1.93–1.99s | 1.14–1.16s | about 41% faster |
| Full `pnpm run build` (5 runs) | 3.18–3.30s, median 3.25s | 2.12–2.15s, median 2.14s | about 34% faster |

The full-command time includes starting Node and loading Astro, which the build timer leaves out. That is what a deploy or a local build actually waits for.

At 12 pages the saving is about a second per build. The percentage matters more as the site grows: Astro's benchmarks show the gap widening on bigger sites.

### What visitors download

| Measure | Astro 5.17.3 | Astro 7.4.4 | Change |
|---|---|---|---|
| `dist/` size | 768 KB | 764 KB | |
| HTML, all 12 pages | 373,764 bytes | 371,463 bytes | 0.6% smaller |
| Home page | 28,854 bytes | 28,693 bytes | |
| Blog posts | 32,095–37,149 bytes | 31,870–36,924 bytes | |
| Separate JS / CSS files | 0 / 0 | 0 / 0 | |
| Font files | 12 | 12 | unchanged |

Page weight barely moves, and that's expected. The site already ships no JavaScript bundles or stylesheet files (styles are inlined with `inlineStylesheets: 'always'`), so there was little for a faster bundler to remove. The 0.6% comes from Astro 7's minifier writing the same CSS and inline scripts more compactly:

- `transparent` becomes `#0000`, and `rgba()` becomes 8-digit hex.
- Default values such as `ease` are dropped.
- Shorthands are reordered.
- Script variables get shorter names.

Every page was compared against the Astro 5 build. The visible text is identical, and the CSS rules are equivalent.

Visitors shouldn't notice a speed difference. Lighthouse scores haven't been measured yet (see below).

### Dev server

Time from starting `astro dev` until the home page first returns, 3 runs each:

| Start | Astro 5.17.3 | Astro 7.4.4 |
|---|---|---|
| Cold (Vite and Astro caches cleared) | 2.13–2.20s | 3.45–3.60s |
| Warm (caches kept) | 1.69–1.79s | 3.09–3.13s |

**Astro 7 was slower to start here, by about 1.4s.** One likely reason: when `astro dev` runs without a terminal attached (as when an AI agent runs it), Astro 7 starts the server as a background process with JSON output and returns straight away. That adds a process hand-off that Astro 5 didn't have. Started from a normal terminal, it may be faster. That wasn't measured, because a simulated terminal stopped the Astro 5 server from starting at all.

Background mode also changes how you stop it: use `npx astro dev stop`, or `astro dev status` and `astro dev logs` to check on it.

## Settings chosen for performance versus looks

- **`compressHTML: true`** (in `astro.config.mjs`). Astro 7's new default, `'jsx'`, strips whitespace between tags. That would make the HTML slightly smaller, but it glued neighbouring text together across the site (for example "learned.P2026"). Keeping the HTML whitespace rules means the pages look exactly as they did. Switching to `'jsx'` later would mean adding explicit spaces (`{" "}`) in the templates wherever inline elements sit next to each other.

## Not measured yet

- **Lighthouse scores.** The machine that ran these checks has no browser. `lighthouse.yml` audits the live site, so run it once before the upgrade deploys (Astro 5) and once after (Astro 7), and add the scores here.
- **Dev server start from a real terminal**, to see whether the slower start is only the background hand-off.

## How these were measured

- **Builds:** `pnpm run build` in `p2026/`, timed from start to finish. Each run started with `dist/`, `.astro/` and `node_modules/.vite` removed, after one warm-up build.
- **Astro 5 numbers:** a separate copy of `main` at `v1.2.11`, with its own `pnpm install --frozen-lockfile`.
- **Dev server:** `astro dev` on a free port, polling `/` until it returned 200.
- **Output comparison:** visible text, inline CSS rules and inline scripts compared page by page between the two `dist/` folders.

## Sources

- [Astro 7 release post](https://astro.build/blog/astro-7/)
- [Astro 7 release coverage (InfoQ)](https://infoq.com/news/2026/08/astro-7-release-speed)
- [Astro 6 release post](https://astro.build/blog/astro-6/)
- [Upgrade to Astro v7](https://docs.astro.build/en/guides/upgrade-to/v7/)
