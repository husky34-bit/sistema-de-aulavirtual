import { z } from 'zod';

export const essaySchema = z.object({
  type: z.literal('essay'),
  minWords: z.number().int().min(0).default(0),
  maxWords: z.number().int().positive().optional(),
  allowAttachments: z.boolean().default(false),
  gradingGuide: z.string().optional(), // guía visible para el docente al calificar
});
