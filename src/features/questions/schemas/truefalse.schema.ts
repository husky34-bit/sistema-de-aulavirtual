import { z } from 'zod';

export const truefalseSchema = z.object({
  type: z.literal('truefalse'),
  correctAnswer: z.boolean(),
  feedbackTrue: z.string().optional(),
  feedbackFalse: z.string().optional(),
});
