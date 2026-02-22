import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://YOUR_GITHUB_USERNAME.github.io',
  // If repo name is NOT your username.github.io, uncomment and set base:
  // base: '/p2026',
  integrations: [mdx()],
});
