# Publishing Workflow Assessment

Last updated: 2026-07-03

## Current state

The repo already has a strong static-first base:

- Astro content collections for `blog` and `projects`
- project detail pages and a generated `/timeline`
- an RSS feed
- a deploy flow for GitHub Pages
- a reusable blog drafting prompt in `prompts/blog_prompt.md`

The gap is not publishing infrastructure. The gap is the step between "a project changed" and "there is now a clean draft blog post ready for review."

Right now the workflow is still mostly manual:

- create or update a project file by hand
- create a blog file by hand
- copy context into a prompt manually
- review and edit the result manually

That is workable for a small site, but it is not yet a repeatable publishing loop.

## Main friction points

- There is no single "project update becomes draft post" command.
- There is no structured place to store bullet points, links, or angle notes for a future post.
- The public project content and the private drafting process are still mixed together conceptually.
- `draft` exists, but there is no stronger editorial workflow around it yet.

## Recommended workflow v1

Keep `projects` as the public publishing anchor and make blog posts a derived draft artifact.

Recommended shape:

1. A project entry remains the source of truth for public metadata.
2. A private seed note stores the raw writing inputs for that project.
3. A generator turns those inputs into a draft blog markdown file.
4. A human reviews, edits, and merges the draft.

## Suggested input model

Prefer a companion seed file over stuffing long drafting notes into project frontmatter.

Example direction:

- public metadata stays in `p2026/src/content/projects/<entry>.md`
- draft inputs live in something like `notes/publishing/<project-slug>.md`

That seed file can hold:

- working title ideas
- candidate tags
- bullet-point backlog
- links and commands worth including
- "what changed" notes
- open questions
- details that should stay private and not be published

This keeps the public schema clean while still giving automation enough structure to work with.

## Recommended automation scope

The first automation should generate drafts, not publish posts.

Good v1 behavior:

- accept a project slug
- read project metadata plus the seed file
- create a new blog markdown file with `draft: true`
- prefill title and description placeholders
- insert the bullet backlog into a clean body scaffold
- optionally emit a prompt-ready summary for use in Codex, ChatGPT, or n8n

Avoid in v1:

- direct production publishing
- automatic cross-posting
- a database-backed CMS
- moving the site off the current file-first model

## CMS direction

Short-term recommendation:

- stay file-first
- improve scaffolding first
- revisit a CMS only if authoring friction remains after the draft generator exists

Current shortlist for later review:

- Pages CMS for a very light Git-backed browser editor
- Front Matter for VS Code-first editing
- Keystatic if a richer local admin layer becomes worth the added complexity
- EmDash as a future platform watch item, not the default next step

## Cross-posting

Cross-posting is worth keeping as a later backlog item, but it should follow draft stability.

The order should be:

1. project update
2. structured seed note
3. generated draft
4. human review
5. publish on P2026
6. optional cross-posting later with canonical URL rules
