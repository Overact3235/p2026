---
title: "Why I chose Astro for this site"
description: "A structured framework that stays out of your way and ships almost nothing to the browser."
pubDate: 2026-02-22
tags: ["astro", "meta"]
project: "p2026"
---

I've been using Astro since early 2024. Not because I evaluated it against a dozen alternatives — because it solved a specific problem I kept running into with other approaches: I wanted a real framework, not a config file.

## Starting from scratch

I came into this wanting to actually learn web development — not just use a tool that abstracts it away. That meant I needed something that would let me write real HTML, real CSS, and real JavaScript without hiding what was happening underneath.

A lot of frameworks make that harder than it should be. You end up fighting the abstraction before you understand what you're abstracting. Astro was different — `.astro` files are essentially HTML files with a script block at the top. If you know HTML, you can read an Astro component on day one.

That mattered because I wanted a path. Start with HTML and CSS, get comfortable with vanilla JavaScript, then move into TypeScript when the project warranted it. Astro doesn't force any of that — but it supports all of it. I could grow into the stack without having to switch tools halfway through.

## What I actually wanted from a framework

Most static site tools give you a folder structure and a templating system. That's fine until you want to build more than one thing. I wanted something I could use as a base — a proper component model, content collections with schema validation, layouts I could extend — so that spinning up a new site meant starting from a solid foundation rather than reinventing the same structure every time.

Astro gave me that. Build a pattern once, reuse it across projects. The same component model, the same deployment pipeline, the same CSS approach — regardless of what the site is for.

## Zero JS by default

This is the thing that keeps me here. Astro ships no JavaScript to the browser unless you explicitly add it. For content-focused sites — blogs, docs, portfolios — this means the output is essentially HTML and CSS. Nothing to parse, nothing to execute, nothing blocking render.

On desktop this barely matters. On mobile on a slow connection, it's the difference between a page that loads instantly and one that makes someone wait. I build sites that real people use on real phones with real network conditions. Shipping zero JS by default is the right starting point.

## Mobile load time

A page with no JavaScript, self-hosted fonts, and clean CSS has almost nothing to slow it down. Lighthouse scores in the high 90s aren't something to tune for — they're just what you get when you don't add unnecessary weight. GitHub Pages serves the static output over a CDN, so the first byte is fast regardless of where the visitor is.

The goal was always a site that loads on the first tap, not the second.

## Islands when you need them

The zero JS default doesn't mean you're locked out of interactivity. Astro's island architecture lets you hydrate individual components on demand — drop in a React, Svelte, or vanilla JS component exactly where you need it, and the rest of the page stays static.

That's the right mental model. Interactivity is opt-in at the component level, not a global setting you toggle for the whole site. Want an animated hero section or an interactive demo? Add it. Everything else stays as fast HTML. You never have to choose between a good-looking site and a performant one.

## Content collections

Defining a schema for your content and having the build fail on malformed frontmatter is underrated. It means typos in a date field or a missing required description break the build locally, not silently in production. For a blog where posts are just markdown files, that's exactly the right guardrail.

## Flexibility

Because Astro is a framework rather than an opinionated blogging tool, you can build anything with it. This site is a blog and project log. The next one could be a landing page, a documentation site, or something with a completely different structure — same tooling, same component patterns, same deployment pipeline. That composability is what makes it worth investing in.