import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://Overact3235.github.io',
  base: '/p2026',
  integrations: [mdx()],
});
