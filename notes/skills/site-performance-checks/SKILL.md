---
name: site-performance-checks
description: Draft skill for reviewing static site performance, including build output, payload size, font loading, CSS cost, JavaScript hydration, image weight, and Lighthouse-style concerns. Use when improving Core Web Vitals or static delivery on a site.
---

# Site Performance Checks

Use this skill for performance review on static or mostly-static sites.

## Workflow

1. Build the site and inspect the generated output.
2. Check whether each page ships only the JavaScript it truly needs.
3. Review CSS size, font delivery, image weight, and third-party requests.
4. Look for render-blocking work, duplicate assets, and unnecessary hydration.
5. Prefer fixes that reduce bytes or remove work entirely.

## Default checks

- Static pages stay static unless interactivity is clearly justified.
- Fonts are self-hosted or otherwise cached efficiently.
- CSS is organized so unused or global-only rules stay manageable.
- Images are appropriately sized and compressed.
- Scripts are deferred or removed when possible.
- No accidental production-time console noise or runtime errors.

## Style

- Anchor recommendations in measurable impact.
- Favor simple changes over framework churn.
- If Lighthouse data exists in the repo, use it as supporting evidence.
