import { z } from 'zod';

export const urlSchema = z.object({
  courseId: z.string().min(1),
  sectionId: z.string().optional().nullable(),
  title: z.string().min(3).max(120),
  url: z.string().url('Debe ser una URL válida'),
  published: z.boolean().default(false),
});

export type UrlInput = z.infer<typeof urlSchema>;
