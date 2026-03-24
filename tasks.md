# Tasks

## Epic 1: Publishing Workflow

- Create a clear path from project update to blog draft, including metadata, slug, and review state.
- Decide which content source is authoritative for new work: `projects`, `blog`, or both with one as the trigger.
- Add or update project detail pages so a project can have a stable home.
- Wire in RSS/feed generation and make sure the homepage and footer point to a real endpoint.

## Epic 2: Content Model Cleanup

- Reconcile `/timeline` with the current project/blog structure.
- Update README and AGENTS content to match the live Astro app.
- Review frontmatter schemas for blog and projects so they are aligned with the new workflow.
- Make sure any new automation writes draft content first, not production-ready posts.

## Epic 3: Site Quality

- Add a lightweight SEO skill for title, description, canonical, and social metadata checks.
- Add a lightweight performance skill for static output, bundle size awareness, and Lighthouse-oriented checks.
- Use those skills to validate the homepage, blog index, and project pages after each change.
- Keep validation steps repeatable so they can be run by sub-agents without extra context.

## Epic 4: CSS Maintainability

- Audit `src/styles/global.css` and group repeated rules into clearer sections.
- Split the stylesheet only if the file is becoming hard to navigate, not just because it is large.
- Prefer structure, naming, and comment boundaries before introducing new CSS files.
- Keep the existing visual system intact while improving readability for future edits.

## Epic 5: Automation and Release Content

- Draft a blog post about GitHub Actions and semantic versioning using the current repo workflows as source material.
- Keep the post human and practical, focused on what the workflow does and why it exists.
- Leave n8n as a future automation layer until the content loop is stable enough to support it.
- If open-source or VPS tooling comes up again, evaluate it separately so it does not distract from the publishing path.

## Epic 6: Lightweight Interactions

- Add small JS enhancements that improve usability without turning the site into an app.
- Prefer plain scripts and Astro page/layout scripts over framework islands.
- Start with status filters, heading copy-links, or other interactions that help readers navigate content.
- Keep every interaction optional, fast, and respectful of the existing static-first approach.
## Sub-Agent Handoff

- Give one sub-agent the docs/content-model cleanup.
- Give one sub-agent the CSS maintainability audit.
- Give one sub-agent the SEO/performance skill draft.
- Give one sub-agent the semantic-release blog draft.
