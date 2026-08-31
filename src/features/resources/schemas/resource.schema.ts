import { z } from 'zod';

export const resourceSchema = z.object({
  courseId: z.string().min(1),
  sectionId: z.string().optional().nullable(),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(120),
  fileId: z.string().min(1, 'Debe adjuntar un archivo'),
  published: z.boolean().default(false),
});

export type ResourceInput = z.infer<typeof resourceSchema>;
