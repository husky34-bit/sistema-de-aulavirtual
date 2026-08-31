import { z } from "zod";

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(100),
  description: z.string().max(500).optional(),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  imageUrl: z.string().optional(),
  area: z.string().optional(),
  level: z.string().optional(),
  modality: z.string().optional(),
  published: z.boolean().default(false),
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
