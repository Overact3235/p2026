# P2026 — Reskin Implementation Notes

> This is a **reskin of an existing Astro 5 project** — not a new build.
> Reference files: `p2026-homepage-v9b.html` · `p2026-about-v9b.html`
> Stack: Astro 5 · TypeScript · Plain CSS (global.css) · Vanilla JS

---

## Before You Start — Audit Your Existing Project

Run these first to understand what you already have:

```bash
# Check Astro version
cat package.json | grep astro

# See your current structure
find src -type f | sort

# Check if content collections are set up
ls src/content/
```

Key things to confirm:
- Does `src/content/config.ts` exist? → Already using content collections
- Are posts in `src/pages/blog/` as `.md` files? → Legacy routing, may need migration
- Does `src/layouts/BaseLayout.astro` exist? → Yes, update it in place
- Does `src/styles/global.css` exist? → Yes, merge carefully (see step 3)

---

## Step 1 — Check Content Collections

Since you're on Astro 5, content collections are the right approach.
Run this to see what's there:

```bash
cat src/content/config.ts 2>/dev/null || echo "No config.ts found"
ls src/content/ 2>/dev/null || echo "No content directory found"
```

**If content collections already exist** — just check your blog schema matches
this shape and add any missing fields:

```typescript
// src/content/config.ts
import { z, defineCollection } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    status: z.enum(['shipped', 'building', 'archived']),
    metric: z.string().optional(),
    stack: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, projects };
```

**If posts are in `src/pages/blog/*.md`** — they work as-is for routing but
you won't get typed frontmatter. You can migrate to content collections later;
for now just query them with `Astro.glob()` in the homepage:

```typescript
const posts = await Astro.glob('../content/blog/*.md');
// or if still in pages:
const posts = await Astro.glob('./blog/*.md');
```

---

## Step 2 — Update BaseLayout.astro

This is the most impactful change. Your existing `BaseLayout.astro` likely has
the old nav, old meta tags, and old theme toggle. Replace or merge the following:

### 2a. Head — add/replace meta tags

```astro
<!-- Replace your existing title/meta block with this -->
<title>{title}</title>
<meta name="description" content={description} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content="website" />
<meta property="og:url" content={canonicalURL} />
<meta name="twitter:card" content="summary" />
<meta name="robots" content="index, follow" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

<!-- IMPORTANT: theme flash prevention — must be in <head>, not body -->
<script is:inline>
  var t = localStorage.getItem('theme');
  if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
</script>
```

### 2b. Props interface — update or add

```astro
---
interface Props {
  title: string;
  description: string;
  canonicalURL?: string;
}

const { title, description, canonicalURL = Astro.url.href } = Astro.props;
const activeRoute = Astro.url.pathname;
---
```

### 2c. Now strip — add above nav

```astro
<!-- Add this as the very first element inside <body> -->
<div class="now-strip">
  <span class="now-strip-dot"></span>
  something shipped. something broken. something learned.
</div>
```

### 2d. Nav — replace existing nav with this

```astro
<nav>
  <a href="/" class="nav-logo">P<span>2026</span></a>
  <div class="nav-right">
    <ul class="nav-links">
      <li><a href="/" class={activeRoute === '/' ? 'active' : ''}>Home</a></li>
      <li><a href="/writing" class={activeRoute.startsWith('/writing') ? 'active' : ''}>Writing</a></li>
      <li><a href="/projects" class={activeRoute.startsWith('/projects') ? 'active' : ''}>Projects</a></li>
      <li><a href="/about" class={activeRoute === '/about' ? 'active' : ''}>About & CV</a></li>
    </ul>
    <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open navigation menu">☰</button>
    <button class="theme-btn" id="themeToggle" aria-label="Toggle light and dark theme">◑</button>
  </div>
</nav>

<!-- Mobile nav — add immediately after the main nav -->
<nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">
  <a href="/" class={activeRoute === '/' ? 'active' : ''}>Home</a>
  <a href="/writing" class={activeRoute.startsWith('/writing') ? 'active' : ''}>Writing</a>
  <a href="/projects" class={activeRoute.startsWith('/projects') ? 'active' : ''}>Projects</a>
  <a href="/about" class={activeRoute === '/about' ? 'active' : ''}>About & CV</a>
</nav>
```

### 2e. Scripts — replace existing theme/nav JS

```astro
<!-- Replace your existing theme script with this -->
<script lang="ts">
  const btn = document.getElementById('themeToggle') as HTMLButtonElement;
  const root = document.documentElement;

  btn?.addEventListener('click', (): void => {
    const dark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    localStorage.setItem('theme', dark ? 'light' : 'dark');
  });

  // Mobile menu
  const menuBtn = document.getElementById('mobileMenuBtn') as HTMLButtonElement;
  const mobileNav = document.getElementById('mobileNav') as HTMLElement;

  menuBtn?.addEventListener('click', (): void => {
    const open = mobileNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? '✕' : '☰';
  });

  // Scroll fade-ins
  const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const parent = entry.target.parentElement;
        if (parent) {
          const siblings = Array.from(parent.querySelectorAll('.reveal'));
          const idx = siblings.indexOf(entry.target);
          (entry.target as HTMLElement).style.transitionDelay = `${idx * 0.06}s`;
        }
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
</script>
```

---

## Step 3 — Update global.css

**Do not wholesale replace your global.css** — you likely have existing post/
page styles in there. Instead, merge carefully:

### 3a. Replace CSS variables block

Find your existing `:root { }` block and replace entirely with:

```css
:root {
  --bg: #f6f3ed;
  --bg-alt: #efebe3;
  --ink: #1a1814;
  --ink-muted: #6b6457;
  --ink-faint: #7a716a;
  --amber: #b86e12;
  --amber-dim: rgba(184,110,18,0.08);
  --rule: #ddd8cc;
  --serif: 'Lora', Georgia, serif;
  --mono: 'JetBrains Mono', monospace;
  --now-bg: #1a1814;
  --now-text: #c47a1e;
}

[data-theme="dark"] {
  --bg: #100f0d;
  --bg-alt: #1a1814;
  --ink: #e5e0d8;
  --ink-muted: #9e968a;
  --ink-faint: #8a8178;
  --amber: #d4891a;
  --amber-dim: rgba(212,137,26,0.1);
  --rule: #252320;
  --now-bg: #c47a1e;
  --now-text: #100f0d;
}
```

### 3b. Add new blocks

Copy these sections from the HTML reference file and append to global.css
(or replace existing equivalents):

- `body::before` — grain texture
- `.now-strip` + `.now-strip-dot`
- `nav`, `.nav-logo`, `.nav-links`, `.nav-right`
- `.mobile-menu-btn`, `.mobile-nav`
- `.theme-btn`
- `@keyframes blink`, `@keyframes fadeUp`
- `.reveal` / `.reveal.visible`
- `footer`, `.footer-copy`, `.footer-links`
- All `@media (max-width: 600px)` rules

### 3c. Leave alone

- Your existing blog post / prose styles
- Any existing `h1-h6` styles inside `.prose` or article scopes
- Your existing code block styles

---

## Step 4 — Update index.astro

Replace the hero and section content. Key changes from your old homepage:

- Hero `h1` is now the slogan, not "Building in public. Logging everything."
- Section headers use `<h2>` not `<span>` for SEO
- Post rows and project rows need the amber left-border hover class
- Add `class="reveal"` to every row for scroll fade-ins
- Add the RSS + "About the builder" CTA strip below the hero meta

---

## Step 5 — Update about.astro

This is largely a new page since the old about was minimal. Drop in the
full content from `p2026-about-v9b.html`. Key sections:

- Hero with CV download button
- Skills & Stack grid
- Work Experience (use `// Redacted` for employers)
- Projects (same data as homepage, but with more detail)
- Contact section (GitHub only — LinkedIn and email kept anonymous)

---

## Step 6 — Fix the Existing Blog Post Styles

Your existing post pages likely have the blue heading issue mentioned earlier.
In whatever layout wraps your blog posts, add:

```css
/* Fix prose heading colors */
.prose h1,
.prose h2,
.prose h3,
.prose h4 {
  color: var(--ink);
  font-family: var(--serif);
}

/* Fix prose link colors */
.prose a {
  color: var(--amber);
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Fix References section specifically */
.prose h2 {
  color: var(--ink);
}
```

---

## Step 7 — Pre-Launch Checklist

- [ ] Replace `https://github.com` → your real GitHub URL
- [ ] Replace `https://p2026.dev` → your real domain in `astro.config.mjs`
- [ ] Add `public/cv.pdf` — your actual CV file
- [ ] Remove or make dynamic the week number in ASCII block
- [ ] Confirm post frontmatter has `title`, `date`, `description` fields
- [ ] Add `name`, `status`, `metric` fields to project frontmatter

**Intentionally left generic — anonymous by design:**
- LinkedIn not linked
- Contact email is an alias (`hello@p2026.dev`) — does not reveal identity
- No real name, photo, or employer shown publicly

---

## Known Gotchas

| # | Issue | Fix |
|---|-------|-----|
| 1 | **Theme flash on load** | The `is:inline` script must stay in `<head>`. Never move it. |
| 2 | **Old font still loading** | Remove old Google Fonts `<link>` tags from BaseLayout — only keep Lora + JetBrains Mono |
| 3 | **`reveal` invisible if JS off** | Add `<noscript><style>.reveal{opacity:1;transform:none}</style></noscript>` to BaseLayout |
| 4 | **Blue headings in existing posts** | Add prose overrides in your post layout (see Step 6) |
| 5 | **Mobile nav was broken before** | Old `display:none` with no hamburger — now fixed with `.mobile-menu-btn` |
| 6 | **Active nav not highlighting** | Use `Astro.url.pathname` not `window.location` — latter doesn't exist at build time |
| 7 | **CV download 404** | File must be in `/public/cv.pdf` not `/src/` |
| 8 | **RSS link in footer** | Needs `@astrojs/rss` integration + `src/pages/rss.xml.ts` |