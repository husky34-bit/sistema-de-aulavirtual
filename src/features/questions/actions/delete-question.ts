'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

export async function deleteQuestion(questionId: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { category: { include: { course: { select: { id: true, instructorId: true } } } } },
  });
  if (!question) return { success: false as const, error: 'Pregunta no encontrada' };
  if (question.category.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  // Desvincular currentVersionId antes de borrar las versiones para evitar restricción de FK
  await prisma.question.update({
    where: { id: questionId },
    data: { currentVersionId: null },
  });

  await prisma.question.delete({ where: { id: questionId } });

  revalidatePath(`/dashboard/courses/${question.category.course.id}/questions`);
  return { success: true as const };
}
