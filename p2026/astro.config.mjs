import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://p2026.xyz',
  // base: '/p2026',
  integrations: [mdx()],
  // Astro 7 defaults to JSX whitespace rules ('jsx'), which drops the spaces
  // between inline elements this site relies on. Keep the HTML rules.
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  },
});
