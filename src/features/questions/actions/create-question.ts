'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { createQuestionSchema } from '../schemas/question.schema';
import { revalidatePath } from 'next/cache';

export async function createQuestion(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const validated = createQuestionSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { name, text, defaultScore, categoryId, data } = validated.data;

  const category = await prisma.questionCategory.findUnique({
    where: { id: categoryId },
    include: { course: { select: { id: true, instructorId: true } } },
  });
  if (!category) return { success: false as const, error: 'Categoría no encontrada' };
  if (category.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  // Crear pregunta + primera versión en una transacción
  const question = await prisma.$transaction(async (tx) => {
    const q = await tx.question.create({
      data: { name, categoryId },
    });

    const version = await tx.questionVersion.create({
      data: {
        questionId: q.id,
        version: 1,
        type: data.type,
        text,
        data: data as object,
        defaultScore,
      },
    });

    return tx.question.update({
      where: { id: q.id },
      data: { currentVersionId: version.id },
    });
  });

  revalidatePath(`/dashboard/courses/${category.courseId}/questions`);
  return { success: true as const, questionId: question.id };
}
