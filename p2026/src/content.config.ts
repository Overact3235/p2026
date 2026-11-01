import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    project: z.string().optional(), // link to a project/subdomain
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    status: z.enum(['shipped', 'building', 'archived']),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    metric: z.string().optional(),
    stack: z.array(z.string()).optional(),
    link: z.string().optional(),
    repo: z.string().optional(),
  }),
});

export const collections = { blog, projects };
