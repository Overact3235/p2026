import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
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
  type: 'content',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    status: z.enum(['shipped', 'building', 'archived']),
    metric: z.string().optional(),
    stack: z.array(z.string()).optional(),
    link: z.string().optional(),
  }),
});

export const collections = { blog, projects };
