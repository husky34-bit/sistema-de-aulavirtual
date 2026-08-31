import { z } from 'zod';

export const folderSchema = z.object({
  courseId: z.string().min(1),
  sectionId: z.string().optional().nullable(),
  title: z.string().min(3).max(120),
  fileIds: z.array(z.string()).default([]),
  published: z.boolean().default(false),
});

export type FolderInput = z.infer<typeof folderSchema>;
