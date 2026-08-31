// Sincronizador de notas al Gradebook.
// Los orígenes (quiz, assignment) llaman a syncGradeToGradebook para que el
// gradebook sea la fuente única de verdad, pero NUNCA sobrescriben un ajuste
// manual del docente (Grade.overridden === true).

import { prisma } from '@/lib/prisma';

export interface SyncGradeInput {
  courseId: string;
  sourceType: 'quiz' | 'assignment';
  sourceId: string;
  userId: string;
  score: number | null; // fracción 0..1 o null si no hay nota
  maxScore?: number; // por si el ítem aún no existe y hay que crearlo
}

/**
 * Sincroniza una nota de origen (quiz/assignment) al gradebook.
 * Si la nota tiene `overridden === true`, NO se sobrescribe (respeta el ajuste
 * manual del docente). Si el GradeItem no existe, lo crea automáticamente.
 */
export async function syncGradeToGradebook(input: SyncGradeInput): Promise<void> {
  const { sourceType, sourceId, userId, score } = input;

  // Buscar el ítem del gradebook vinculado a este origen.
  // @@unique([sourceType, sourceId]) garantiza que hay 0 o 1.
  const gradeItem = await prisma.gradeItem.findUnique({
    where: {
      sourceType_sourceId: { sourceType, sourceId },
    },
    select: { id: true },
  });

  if (!gradeItem) {
    // El ítem se creará cuando el docente publique el quiz/assignment,
    // no aquí. Si no existe, no hay nada que sincronizar.
    return;
  }

  // Upsert de la nota respetando overrides.
  const existing = await prisma.grade.findUnique({
    where: {
      gradeItemId_userId: { gradeItemId: gradeItem.id, userId },
    },
    select: { overridden: true },
  });

  if (existing?.overridden) {
    // El docente ajustó manualmente esta nota: respetar.
    return;
  }

  await prisma.grade.upsert({
    where: {
      gradeItemId_userId: { gradeItemId: gradeItem.id, userId },
    },
    create: {
      gradeItemId: gradeItem.id,
      userId,
      score,
      overridden: false,
    },
    update: {
      score,
      overridden: false,
    },
  });
}
