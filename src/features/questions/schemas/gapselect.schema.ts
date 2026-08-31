import { z } from 'zod';

// Unifica gapselect y multianswer (cloze): huecos [[1]], [[2]] en el texto
// que se rellenan eligiendo de una lista de opciones.
export const gapselectSchema = z.object({
  type: z.enum(['gapselect', 'multianswer']),
  // el enunciado va en Question.text con marcadores [[1]], [[2]]...
  gaps: z.array(
    z.object({
      gapNumber: z.number().int().positive(),
      options: z.array(
        z.object({
          text: z.string().min(1),
          fraction: z.number().min(0).max(1),
        })
      ).min(2),
      shuffle: z.boolean().default(true),
    })
  ).min(1, 'Define al menos un hueco'),
});
