# October 2026 Security Update

- Date: 2026-10-31
- Site release at time of check: `v1.2.8`
- Related: D-012 in `decisions.md` (replaces D-007), step 5.1 in `notes/remediation-roadmap.md`

A check of the Astro version the site runs on, what the latest Astro is, and whether upgrading brings security fixes or performance gains. Nothing is upgraded here. This is the record the upgrade work starts from.

## What the site runs now

| Package | Version | Released |
|---|---|---|
| `astro` | 5.17.3 (pinned in `package.json`) | 2026-02-18 |
| `@astrojs/mdx` | 4.3.13 | |
| Node (CI, Netlify) | 24 | |
| pnpm | 10.30.3 (from `packageManager`) | |

## What's available

| Line | Latest | Notes |
|---|---|---|
| Astro 5 | 5.18.2 | Still gets the odd patch, but most security fixes are not backported (see below). |
| Astro 6 | 6.4.8 | First released 2026-03-10. |
| Astro 7 | **7.4.4** (latest, 2026-10-28) | First released 2026-06-22. Needs Node 22.23.4 or newer, which CI already meets. |
| `@astrojs/mdx` | 8.1.2 | The version that matches Astro 7. 4.3.14 is the last for Astro 5. |

## Security

`pnpm audit` on 2026-10-31: **63 advisories** (1 critical, 28 high, 27 moderate, 7 low). For comparison, the 2026-10-10 scan found 56.

They all come in through `astro` and its own dependencies: `vite`, `devalue`, `h3`, `picomatch`, `postcss`, `js-yaml`, `smol-toml`, `sharp`, `nanoid`, `svgo`, `defu`, `esbuild`, `source-map-js`, and `zod`.

### Advisories in `astro` itself

| Severity | Issue | Fixed in |
|---|---|---|
| Critical | Remote code execution through AVIF image optimisation ([GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2)) | 7.2.8 |
| High | Host header SSRF in prerendered error page fetch ([GHSA-2pvr-wf23-7pc7](https://github.com/advisories/GHSA-2pvr-wf23-7pc7)) | 6.4.6 |
| High | Reflected XSS via unescaped slot name ([GHSA-8hv8-536x-4wqp](https://github.com/advisories/GHSA-8hv8-536x-4wqp)) | 6.3.3 |
| Moderate | XSS in `define:vars` ([GHSA-j687-52p2-xcff](https://github.com/advisories/GHSA-j687-52p2-xcff)) | 6.1.6 |
| Moderate | XSS via spread attribute names ([GHSA-jrpj-wcv7-9fh9](https://github.com/advisories/GHSA-jrpj-wcv7-9fh9), [GHSA-f48w-9m4c-m7f5](https://github.com/advisories/GHSA-f48w-9m4c-m7f5)) | 6.4.6, 7.0.6 |
| Moderate | XSS via View Transition animation properties ([GHSA-4g3v-8h47-v7g6](https://github.com/advisories/GHSA-4g3v-8h47-v7g6)) | 7.1.0 |
| Moderate | Authorization bypass when stripping `base` ([GHSA-376h-93r7-7g6f](https://github.com/advisories/GHSA-376h-93r7-7g6f)) | 7.2.4 |
| Moderate | XSS via `<script>`/`<style>` content in JSX/MDX ([GHSA-98hj-9722-w3j8](https://github.com/advisories/GHSA-98hj-9722-w3j8)) | 7.3.2 |
| Low | `transition:*` directive XSS, server island replay, remote allowlist bypass | 7.0.4, 6.1.10, 5.18.1 |

### What this means for this site

- **Real exposure is low.** The site is fully static: no adapter, no server, no server islands, no image optimisation (`astro:assets` isn't used), no `define:vars`, no View Transitions. Content is only what's committed to this repo. Most of these advisories need a running server or untrusted input. The critical AVIF one needs Astro to process an untrusted AVIF image, which this site never does.
- **The dependency advisories mostly affect the dev server and build** (`vite`, `h3`, `esbuild`), so the exposure is a local `astro dev` or a CI build, not the live site.
- **Astro 5 no longer gets most security fixes.** Of the 12 `astro` advisories, only one (low) is fixed on the 5.x line (5.18.1). Everything else is fixed only in 6.x or 7.x, and the critical one only in 7.2.8 or later.

## Performance

From Astro's release posts:

- **Astro 6** (2026-03): redesigned dev server, rendering performance work, built-in Fonts and Content Security Policy APIs, and an experimental Rust compiler.
- **Astro 7** (2026-06): moves to Vite 8 with the Rust-based Rolldown bundler, a Rust `.astro` compiler, a Rust Markdown and MDX pipeline, and a faster rendering engine. Astro reports builds 15–61% faster. astro.build went from 62.7s to 24.2s.

### Baseline for this site (Astro 5.17.3, 2026-10-31)

Measured in the remote session, three runs of `pnpm run build`:

| Measure | Value |
|---|---|
| Pages built | 12 |
| Astro build time | 1.93s, 1.95s, 1.99s |
| `dist/` size | 768 KB |
| HTML total | 374 KB over 12 files (home page 28.9 KB, blog posts 32–37 KB) |
| Separate JS / CSS files | 0 / 0 (styles and scripts are inlined, `inlineStylesheets: 'always'`) |

What to expect from Astro 7 here: faster builds and dev server, but on a 2-second, 12-page build that's small in absolute terms. Page weight and load speed for visitors should barely move, since the site already ships no separate JS or CSS. The performance case is weaker than the security case.

## Recommendation

1. **Go straight to Astro 7 instead of bumping within 5.x.** Roadmap step 2.3 (latest 5.x) would only clear one low advisory. Accepted as D-012: step 2.3 is dropped, and the Astro 7 upgrade (roadmap step 5.2) is the next site change after this update.
2. **Upgrade `@astrojs/mdx` with it** (4.x to 8.x).
3. **Follow the v6 and v7 upgrade guides in order**, and re-run the baseline above afterwards to record the before and after.
4. **Re-run `pnpm audit` after the upgrade** and record what's left in the PR.

## Astro 7 comparison

To be filled in by roadmap step 5.2 (`feature/astro-7-upgrade`): the same measurements on Astro 7, Lighthouse scores for both versions, and the `pnpm audit` result after the upgrade.

## Sources

- [Astro 7 release post](https://astro.build/blog/astro-7/)
- [Astro 7 release coverage (InfoQ)](https://infoq.com/news/2026/08/astro-7-release-speed)
- [Astro 6 release post](https://astro.build/blog/astro-6/)
- [Upgrade to Astro v7](https://docs.astro.build/en/guides/upgrade-to/v7/)
- [GHSA-26w7-cxv4-gfx2 (AVIF RCE)](https://github.com/advisories/GHSA-26w7-cxv4-gfx2)
- npm registry: `npm view astro`, `npm view @astrojs/mdx` (2026-10-31)
