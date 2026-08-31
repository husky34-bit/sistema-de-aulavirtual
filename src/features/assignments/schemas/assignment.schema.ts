import { z } from 'zod';

// Estados de un envío de tarea
export const submissionStatusSchema = z.enum(['draft', 'submitted', 'graded']);

// Esquema de creación/edición de una tarea.
// Validación cruzada de fechas: dueAt > openAt y cutoffAt >= dueAt.
export const assignmentSchema = z
  .object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(120, 'El título no puede exceder 120 caracteres'),
    description: z.string().max(2000).optional(),
    instructions: z.string().max(20000).optional(),
    maxScore: z.number().min(1, 'El puntaje máximo debe ser mayor a 0').max(1000).default(100),
    // ventana de entrega (ISO strings opcionales)
    openAt: z.string().datetime().optional(),
    dueAt: z.string().datetime().optional(),
    cutoffAt: z.string().datetime().optional(),
    // modalidades de entrega
    allowOnlineText: z.boolean().default(true),
    allowFiles: z.boolean().default(false),
    maxFiles: z.number().int().min(1).max(20).default(1),
    maxFileSizeMb: z.number().int().min(1).max(100).default(10),
    published: z.boolean().default(false),
    sectionId: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // dueAt > openAt
      if (data.openAt && data.dueAt) {
        if (new Date(data.dueAt) <= new Date(data.openAt)) return false;
      }
      return true;
    },
    { message: 'La fecha límite (dueAt) debe ser posterior a la apertura (openAt)', path: ['dueAt'] },
  )
  .refine(
    (data) => {
      // cutoffAt >= dueAt
      if (data.dueAt && data.cutoffAt) {
        if (new Date(data.cutoffAt) < new Date(data.dueAt)) return false;
      }
      return true;
    },
    { message: 'La fecha de corte (cutoffAt) no puede ser anterior a la fecha límite (dueAt)', path: ['cutoffAt'] },
  )
  .refine(
    (data) => {
      // al menos una modalidad de entrega
      return data.allowOnlineText || data.allowFiles;
    },
    { message: 'Debe habilitar al menos una modalidad de entrega (texto o archivos)', path: ['allowFiles'] },
  );

export type AssignmentInput = z.infer<typeof assignmentSchema>;
