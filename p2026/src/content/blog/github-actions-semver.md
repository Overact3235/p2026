---
title: "Shipping P2026 with GitHub Actions and Patch-Only Releases"
description: "How I deploy the site and keep releases simple with GitHub Actions."
pubDate: 2026-03-23
tags: ["github-actions", "semantic-release", "ci"]
project: "p2026"
draft: true
---

I have a soft spot for build pipelines that stay out of the way. If I have to think about the deployment too much, I probably built the wrong thing. For P2026, the goal is not to have a fancy release platform. The goal is to have a boring, dependable path from commit to live site.

That is why the current setup is split into a few narrow jobs instead of one giant workflow that tries to do everything. One workflow builds and deploys the site to GitHub Pages. Another creates releases. A separate Lighthouse workflow is there when I want to check the public site without baking that cost into every push. It is simple on purpose.

## The deploy path

The deploy workflow is the one I care about most, because it is the thing that turns writing and editing into something visible. In `deploy.yml`, the site builds on every push to `main` and can also be triggered manually. It checks out the repo, installs `pnpm`, sets up Node 24, runs the install, builds the Astro app, and uploads the `dist` folder as a Pages artifact.

What I like about that flow is that it keeps the production story very close to the code. There is no hidden server, no extra build machine, and no manual copy step. If the build passes, the artifact goes up. If it does not, I know immediately.

The workflow also makes the tool choices obvious. The site itself uses `pnpm`, while the deployment is still just GitHub Pages doing static hosting. That feels right for a small project like this. I am not trying to create an elaborate DevOps exercise out of a personal site. I just want a clean push-button path from repo to published page.

## Why releases exist at all

The release workflow is a little different. It is not about deployment. It is about having a durable record of change.

In `release.yml`, the workflow runs on pushes to `main`, checks out the repo with a shallow, blobless clone, sets up Node 24, installs the semantic-release packages, and runs `semantic-release`. The interesting part is that the workflow is intentionally lightweight. It does not keep a pile of release tooling in the repo all the time. It installs what it needs, does the job, and gets out.

That matters to me because this is a one-person project. I do not need a heavyweight release process, but I do want a repeatable one. A release workflow gives me a place where the change history becomes explicit, which is useful when I am moving fast and shipping often.

It also gives me a better mental model for the site itself. A blog post, a content tweak, a deployment fix, and a minor CSS cleanup are all real changes. Even if the code is small, I still want a release note that says, in plain terms, what moved.

## Patch-only semantic versioning

The versioning rule is the part that makes the whole setup feel a bit unusual. In `release.config.js`, almost everything maps to a patch bump. `feat`, `fix`, `perf`, `docs`, `style`, `chore`, `refactor`, `test`, `build`, and `ci` all resolve to patch. There is even a catch-all rule for squash merges with non-conventional PR titles.

That is not how semantic versioning is usually taught, but it is how I want this project to behave right now. P2026 is a personal site, not a public library with API compatibility promises. The version number is more of a release trail than a strict contract with external consumers.

Keeping releases on the patch line gives me a few things:

- I can ship frequently without debating whether a content update deserves a minor bump.
- I do not have to worry about version inflation for small design or copy changes.
- I still get tags and release notes, which is the useful part for a site like this.

The config also leaves an escape hatch. If I ever want to move to a new series, I can push a manual tag like `v1.2.0` or `v2.0.0`. That is a nice balance: the day-to-day flow stays dead simple, but I am not locking myself into the current scheme forever.

## The Lighthouse step

The Lighthouse workflow is the quiet one in the background. It is manual, which I prefer. I do not need a performance audit on every single push, especially when I am often changing content or styling in tiny increments.

Instead, `lighthouse.yml` gives me an on-demand audit of the live site. That is useful for checking whether a change actually helped or hurt without making the deploy workflow heavier than it needs to be. It keeps performance as a habit instead of a bottleneck.

That split also matches how I think about the site in general. Deployment should be automatic. Releases should be predictable. Performance checks should be available when I need them, not forced at every step.

## What this setup is really for

I think the real value here is not the tools themselves. It is the feedback loop they create.

The deploy workflow lets me publish quickly. The release workflow gives me a clean history of what changed. The Lighthouse check keeps me honest about speed. The semantic-release config keeps the versioning easy enough that I will actually use it.

That feels like the right level of ceremony for P2026. I am trying to build in public, learn the pieces properly, and keep the site lightweight enough that it still feels like mine. A boring pipeline is a feature when it frees me up to write, ship, and move on to the next thing.

If I come back to this later, I expect the shape to stay similar. Maybe the workflows get cleaner. Maybe the release notes get richer. Maybe I automate a little more of the content side. But I do not want to lose the core idea: push code, build site, ship page, note the release, repeat.
