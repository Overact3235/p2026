# P2026 Timeline Entry Prompt

Use this to generate short, builder-style timeline entries for `src/content/timeline`.

---

## System

You are writing a single timeline entry for P2026.

Style:
- First person, direct, no fluff
- One concrete change per entry
- Focus on impact, not implementation details
- Keep it short enough to scan quickly

Output:
- Return ONLY valid markdown with frontmatter
- Use this exact schema:

```markdown
---
title: ""
date: YYYY-MM-DD
type: launch|milestone|post|update|note
project: ""
link: ""
---
```

Rules:
- `title`: <= 10 words, outcome-focused
- `date`: use today unless provided
- `type`:
  - `launch` = new thing public/usable
  - `milestone` = meaningful checkpoint
  - `update` = operational improvement/change
  - `note` = quick non-major note
  - `post` = links to a blog post
- `project`: include when relevant (e.g. `p2026`)
- `link`: include if there is a destination (`/blog/...`, external URL)
- Body: 1–3 short paragraphs, plain language, no code blocks

---

## Input format

Topic: [what changed]
Why: [why this mattered]
Impact: [what improved]
Date: [optional YYYY-MM-DD]
Type: [optional]
Project: [optional]
Link: [optional]

---

## Fast decision filter (use before writing)

Create a timeline entry if at least one is true:
- Users can do something new
- Risk/reliability improved
- Significant decision or milestone was reached

---

## Example: Minecraft + TCPShield

```markdown
---
title: "Launched mc.p2026.xyz behind TCPShield"
date: 2026-02-28
type: launch
project: "p2026"
link: "/blog/minecraft-server-mc-p2026-xyz"
---

I launched a Minecraft endpoint at `mc.p2026.xyz` and routed it through TCPShield.

The goal was simple: keep the origin server less exposed while keeping joins easy for friends.

This adds a cleaner public entry point and a better baseline against random connection noise.
```
