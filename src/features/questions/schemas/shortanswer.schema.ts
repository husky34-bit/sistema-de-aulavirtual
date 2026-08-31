import { z } from 'zod';

export const shortanswerSchema = z.object({
  type: z.literal('shortanswer'),
  caseSensitive: z.boolean().default(false),
  // lista de respuestas aceptadas; '*' funciona como comodín
  answers: z.array(
    z.object({
      text: z.string().min(1),
      fraction: z.number().min(0).max(1).default(1),
    })
  ).min(1, 'Define al menos una respuesta correcta'),
});
