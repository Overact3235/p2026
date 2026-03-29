# Tasks

This file tracks active work. Use `roadmap.md` for direction and `backlog/` for ideas that are not scheduled yet.

## Epic 1: Publishing Workflow

- Create a clear path from project update to blog draft, including metadata, slug, and review state.
- Decide which content source is authoritative for new work: `projects`, `blog`, or both with one as the trigger.
- Add or update project detail pages so a project can have a stable home.
- Keep RSS/feed and metadata basics wired into the homepage and footer.

## Epic 2: CMS Evaluation and Authoring UX

- Keep the repo and Markdown content collections as the source of truth.
- Compare the lightest authoring options first: plain file workflow, Front Matter CMS, and Pages CMS.
- Treat a browser CMS as an authoring layer, not a separate content platform or database.
- If a CMS is added, make sure its output still lands in Git so the existing build flow remains the publish trigger.
- Prefer draft-first writing and review over direct production publishing.

## Epic 3: Content Model and Docs Cleanup

- Reconcile `/timeline` with the current project/blog structure.
- Update README and AGENTS content to match the live Astro app and planning workflow.
- Review frontmatter schemas for blog and projects so they are aligned with the publishing workflow.
- Document how `roadmap.md`, `tasks.md`, and `backlog/` are meant to work together.
- Make sure any new automation writes draft content first, not production-ready posts.

## Epic 4: Preview Environments and Branch Flow

- Keep `main` as the public production branch and integration branch unless the project complexity proves otherwise.
- Add a disposable `preview` branch for selective Netlify deploys when a stable test URL is useful.
- Decide when Netlify PR previews are enough versus when the `preview` branch should be updated manually.
- Define a safe workflow for syncing a chosen `feature/*` branch onto `preview` without muddying production history.
- Document when a true `develop` branch would be worth introducing later.
- Use the preview environment for SEO, plugin, and build checks before changes reach `main`.

## Epic 5: Site Quality

- Add a lightweight SEO skill for title, description, canonical, and social metadata checks.
- Add a lightweight performance skill for static output, bundle size awareness, and Lighthouse-oriented checks.
- Use those checks to validate the homepage, blog index, project pages, and preview builds after each change.
- Keep validation steps repeatable so they can be run without extra setup.

## Epic 6: CSS Maintainability

- Audit `src/styles/global.css` and group repeated rules into clearer sections.
- Split the stylesheet only if the file is becoming hard to navigate, not just because it is large.
- Prefer structure, naming, and comment boundaries before introducing new CSS files.
- Keep the existing visual system intact while improving readability for future edits.

## Epic 7: Automation and Release Content

- Draft a blog post about GitHub Actions and semantic versioning using the current repo workflows as source material.
- Keep the post human and practical, focused on what the workflow does and why it exists.
- Leave n8n as a future automation layer until the content loop is stable enough to support it.
- If open-source or VPS tooling comes up again, evaluate it separately so it does not distract from the publishing path.

## Epic 8: Lightweight Interactions

- Add small JS enhancements that improve usability without turning the site into an app.
- Prefer plain scripts and Astro page/layout scripts over framework islands.
- Start with status filters, heading copy-links, or other interactions that help readers navigate content.
- Keep every interaction optional, fast, and respectful of the existing static-first approach.
