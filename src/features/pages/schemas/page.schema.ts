import { z } from 'zod';

export const pageSchema = z.object({
  courseId: z.string().min(1),
  sectionId: z.string().optional().nullable(),
  title: z.string().min(3).max(120),
  content: z.string().max(200000),
  published: z.boolean().default(false),
});

export type PageInput = z.infer<typeof pageSchema>;
