import { z } from 'zod';

export const labelSchema = z.object({
  courseId: z.string().min(1),
  sectionId: z.string().optional().nullable(),
  content: z.string().min(1).max(20000),
});

export type LabelInput = z.infer<typeof labelSchema>;
