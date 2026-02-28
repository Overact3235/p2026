---
title: "Why I chose Astro for this site"
description: "Why Astro fits my build-first workflow and ships fast static pages."
pubDate: 2026-02-22
tags: ["astro", "meta"]
project: "p2026"
---

I started using Astro because I wanted structure without heavy abstraction. I wanted to write real HTML and CSS, keep JavaScript optional, and still have a framework I could scale across projects.

## Why Astro fits how I build

The best part of Astro is that it feels close to the platform. `.astro` files are readable on day one if you already know HTML. That mattered to me because I wanted to learn the fundamentals first, then add complexity only when needed.

I also wanted a repeatable system, not just a one-off blog setup. Astro gave me reusable layouts, predictable routing, and content collections with schema validation. That means less glue code, fewer silent content errors, and a cleaner path when spinning up the next project.

## Performance model

Astro’s default model matches how I think about content sites: ship static HTML first, add interactivity only where it earns its cost. For most pages, that means no client-side JavaScript by default.

In practice, this leads to a simpler performance baseline:

- less JavaScript parse/execute work on first load
- fewer moving parts on weaker mobile connections
- easier optimization because the output is mostly HTML and CSS

When I do need interactivity, I can add it at the component level with islands instead of hydrating the entire page. That keeps performance decisions local and explicit.

## Content workflow

Content collections are one of the most useful features in day-to-day use. Frontmatter is validated against a schema, so malformed dates, missing fields, or wrong types fail during build instead of leaking into production.

For this site, that makes publishing calmer. I can treat markdown files as data with guardrails, not just loose text documents.

## Why I keep using it

Astro gives me a good balance:

- framework-level structure
- low runtime overhead
- flexible enough for blogs, docs, and project sites

That is the main reason I standardized on it for P2026 and other personal builds: it scales from simple static pages to more interactive work without forcing a full rewrite of the stack.

## References

- [My Resources Page](https://p2026.xyz/resources)
- [Astro](https://astro.build/)
- [Astro Docs](https://docs.astro.build/)
- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/)