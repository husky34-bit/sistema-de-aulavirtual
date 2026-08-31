import { z } from 'zod';

export const bookSchema = z.object({
  courseId: z.string().min(1),
  sectionId: z.string().optional().nullable(),
  title: z.string().min(3).max(120),
  published: z.boolean().default(false),
});

export const chapterSchema = z.object({
  bookId: z.string().min(1),
  title: z.string().min(1).max(120),
  content: z.string().max(200000),
  position: z.number().int().min(0).optional(),
});

export type BookInput = z.infer<typeof bookSchema>;
export type ChapterInput = z.infer<typeof chapterSchema>;
