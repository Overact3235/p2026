---
title: "Why my homelab repo keeps a decisions log"
description: "A single file recording what I decided, and more importantly, what I rejected."
pubDate: 2026-11-05
tags: ["homelab", "documentation"]
draft: true
---

My infrastructure repo has a file called `DECISIONS.md`. It records each real choice I've made about the setup: where builds run, how DNS fails over, how coding agents get credentials. The most useful part of every entry is the list of options I didn't pick.

## The problem it solves

I kept having the same conversations with myself. Should the VPS build the static site itself? Should I cluster my Proxmox nodes? I'd work through it, decide, and a few months later the same idea would come back looking fresh. The reasoning was gone, so I had to rebuild it from memory.

The file's header says it plainly:

> A decision whose alternatives were never written down gets re-proposed every few months, and the reasoning has to be rebuilt from memory each time.

A roadmap tracks what's being built, and commit history tracks what changed. Neither says why a road wasn't taken.

## What an entry looks like

Every entry has the same five parts: a date, a status, the decision, why, and what was rejected. Here's the first one, trimmed:

```markdown
## D-001 - Build in GitHub Actions, never on VM1

**Date:** 2026-08-20
**Status:** Accepted.
**Decision:** Astro builds run on the GitHub Actions runner. VM1 gets
no Node, no pnpm, no node_modules, and no build container.

**Why:** the runner is already ephemeral and isolated ...

**Rejected:** building on VM1; building in a container on the runner.
```

Short entries are fine. The bigger ones, like how I run coding agents, list ten rejected options, each with a sentence on why. That's the list I'd otherwise rebuild from scratch the next time I'm tempted.

## Rules that keep it honest

**Newest first.** I usually want the latest call.

**Never edit a past decision.** If I reverse one, I add a new entry and mark the old one `SUPERSEDED by D-nn`. The reversal and its reason end up being the most valuable thing in the file. They show what I learned that I didn't know the first time.

**Only decisions that were actually weighed.** If there was no real alternative, it doesn't belong here. Otherwise the file turns into a changelog.

**Keep an "Open, not yet decided" section at the bottom.** Things I know I'll have to decide, with what's blocking them. It stops a pending question from quietly turning into a default.

## The numbering problem

I number entries `D-001`, `D-002` and so on, and I write each one on the feature branch it belongs to. That breaks down when several branches are open at once. At one point, unmerged branches had already claimed D-008 through D-017. So the next decision on `main` became D-018, and the file's history explains the gap.

It looks messy, but it's fine. The numbers are IDs, not an order. A gap means something is still waiting on a branch, not that something is missing.

## It also helps the AI tools

I use coding agents on this repo, and they're very good at proposing an approach I already rejected, with total confidence. The repo's agent instructions now say to check `DECISIONS.md` before re-proposing anything, and to add a superseding entry instead of editing an old one. An agent doesn't remember last month's conversation, but it can read a file. Neither do I, really, which is the whole reason the file exists.

If you run anything at home that you'll still be changing in a year, start the file now. Seed it with the calls you've already made. They're scattered across your notes and READMEs anyway.
