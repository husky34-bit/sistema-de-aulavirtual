import { z } from 'zod';

// Métodos de agregación de categorías del gradebook
export const aggregationSchema = z.enum([
  'mean',
  'weighted',
  'median',
  'sum',
  'max',
  'min',
  'mode',
]);
export type AggregationType = z.infer<typeof aggregationSchema>;

// Tipo de origen de un ítem (null = manual)
export const gradeSourceTypeSchema = z.enum(['quiz', 'assignment']);

// Creación de un ítem manual de calificación (Participación, Examen Oral, etc.)
export const gradeItemSchema = z.object({
  courseId: z.string().min(1),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(120),
  maxScore: z.number().min(1).max(1000).default(100),
  weight: z.number().min(0).max(100).default(1),
  categoryId: z.string().optional().nullable(),
  position: z.number().int().min(0).default(0),
});

export type GradeItemInput = z.infer<typeof gradeItemSchema>;

// Creación de una categoría de calificación (puede anidarse en parentId)
export const gradeCategorySchema = z.object({
  courseId: z.string().min(1),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(120),
  parentId: z.string().optional().nullable(),
  aggregation: aggregationSchema.default('mean'),
  position: z.number().int().min(0).default(0),
});

export type GradeCategoryInput = z.infer<typeof gradeCategorySchema>;

// Actualización del método de agregación de una categoría
export const updateAggregationSchema = z.object({
  categoryId: z.string().min(1),
  aggregation: aggregationSchema,
});

export type UpdateAggregationInput = z.infer<typeof updateAggregationSchema>;

// Modificación manual de una nota desde la tabla del calificador
export const updateGradeSchema = z.object({
  gradeItemId: z.string().min(1),
  userId: z.string().min(1),
  score: z.number().min(0).max(1000).nullable(),
});

export type UpdateGradeInput = z.infer<typeof updateGradeSchema>;

// Escala cualitativa de desempeño (Sobresaliente, Notable, etc.)
export const gradeScaleSchema = z.object({
  courseId: z.string().min(1).optional().nullable(),
  name: z.string().min(3).max(120),
  description: z.string().max(2000).optional(),
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        minPercent: z.number().min(0).max(100),
        description: z.string().max(2000).optional(),
      }),
    )
    .min(1, 'Debe incluir al menos un nivel'),
});

export type GradeScaleInput = z.infer<typeof gradeScaleSchema>;

// Letras configurables (A, B, C, F) por porcentaje
export const gradeLetterSchema = z.object({
  courseId: z.string().min(1),
  letter: z.string().min(1).max(5),
  minPercent: z.number().min(0).max(100),
  description: z.string().max(2000).optional(),
});

export type GradeLetterInput = z.infer<typeof gradeLetterSchema>;
