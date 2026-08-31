import { z } from 'zod';

export const orderingSchema = z.object({
  type: z.literal('ordering'),
  // elementos en el ORDEN CORRECTO; la UI los muestra barajados
  items: z.array(z.string().min(1)).min(3, 'Mínimo 3 elementos'),
});
