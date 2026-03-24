---
name: seo-checks
description: Draft skill for checking static site SEO basics such as titles, descriptions, canonical URLs, headings, metadata, and indexability. Use when reviewing or improving a site for search discoverability, social previews, or content metadata quality.
---

# SEO Checks

Use this skill for lightweight SEO review on static sites.

## Workflow

1. Inspect the page template and rendered HTML, not just source content.
2. Verify `title`, `meta description`, canonical URL, `robots`, and social tags.
3. Check heading order, internal linking, and image alt text.
4. Confirm sitemap/RSS coverage if the site publishes content feeds.
5. Report only issues that materially affect discoverability or previews.

## Default checks

- Unique title per page.
- Description matches the page purpose.
- Canonical points at the public URL.
- Open Graph and Twitter metadata are present where relevant.
- Exactly one clear `h1`.
- Links are descriptive, not generic.
- Content that should be indexed is not blocked.

## Style

- Prefer small, actionable fixes.
- Use repo-native evidence first.
- Avoid recommending heavy third-party SEO tooling unless the repo already uses it.
