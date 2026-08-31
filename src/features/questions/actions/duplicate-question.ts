'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

export async function duplicateQuestion(questionId: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const source = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      currentVersion: true,
      category: { include: { course: { select: { id: true, instructorId: true } } } },
    },
  });
  if (!source?.currentVersion) return { success: false as const, error: 'Pregunta no encontrada' };
  if (source.category.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  await prisma.$transaction(async (tx) => {
    const copy = await tx.question.create({
      data: { name: `${source.name} (copia)`, categoryId: source.categoryId },
    });

    const version = await tx.questionVersion.create({
      data: {
        questionId: copy.id,
        version: 1,
        type: source.currentVersion!.type,
        text: source.currentVersion!.text,
        data: source.currentVersion!.data as object,
        defaultScore: source.currentVersion!.defaultScore,
      },
    });

    await tx.question.update({
      where: { id: copy.id },
      data: { currentVersionId: version.id },
    });
  });

  revalidatePath(`/dashboard/courses/${source.category.course.id}/questions`);
  return { success: true as const };
}
