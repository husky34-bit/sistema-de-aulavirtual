import { z } from 'zod';

// Esquema de envío de tarea por un estudiante.
export const submitSchema = z.object({
  assignmentId: z.string().min(1, 'Se requiere el ID de la tarea'),
  // texto en línea (máximo 20,000 caracteres)
  onlineText: z.string().max(20000, 'El texto no puede exceder 20,000 caracteres').optional(),
  // modo de guardado: 'draft' | 'submit'
  mode: z.enum(['draft', 'submit']).default('submit'),
});

export type SubmitInput = z.infer<typeof submitSchema>;

// Esquema de calificación de un envío por un docente.
export const gradeSubmissionSchema = z.object({
  submissionId: z.string().min(1, 'Se requiere el ID del envío'),
  score: z.number().min(0, 'La nota no puede ser negativa').max(1000),
  feedback: z.string().max(20000).optional(),
});

export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
