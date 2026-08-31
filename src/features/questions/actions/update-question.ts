'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { createQuestionSchema } from '../schemas/question.schema';
import { revalidatePath } from 'next/cache';

// Editar = crear NUEVA VERSIÓN (los intentos históricos quedan intactos)
export async function updateQuestion(questionId: string, input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      category: { include: { course: { select: { id: true, instructorId: true } } } },
      versions: { orderBy: { version: 'desc' }, take: 1 },
    },
  });
  if (!question) return { success: false as const, error: 'Pregunta no encontrada' };
  if (question.category.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const validated = createQuestionSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { name, text, defaultScore, data } = validated.data;
  const nextVersion = (question.versions[0]?.version ?? 0) + 1;

  await prisma.$transaction(async (tx) => {
    const version = await tx.questionVersion.create({
      data: {
        questionId,
        version: nextVersion,
        type: data.type,
        text,
        data: data as object,
        defaultScore,
      },
    });

    await tx.question.update({
      where: { id: questionId },
      data: { name, currentVersionId: version.id },
    });
  });

  revalidatePath(`/dashboard/courses/${question.category.course.id}/questions`);
  return { success: true as const };
}
