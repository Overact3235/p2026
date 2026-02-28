import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://p2026.xyz',
  // base: '/p2026',
  integrations: [mdx()],
  build: {
    inlineStylesheets: 'always',
  },
});
