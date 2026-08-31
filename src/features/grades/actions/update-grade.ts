'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { updateGradeSchema } from '../schemas/grade.schema';
import { revalidatePath } from 'next/cache';

// Modificación manual de notas desde la tabla del calificador.
// Marca overridden: true y registra el docente auditor.
export async function updateGrade(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const validated = updateGradeSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { gradeItemId, userId, score } = validated.data;

  const item = await prisma.gradeItem.findUnique({
    where: { id: gradeItemId },
    select: { id: true, courseId: true, course: { select: { instructorId: true } }, maxScore: true },
  });
  if (!item) return { success: false as const, error: 'Ítem no encontrado' };
  if (item.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  if (score !== null && score > item.maxScore) {
    return { success: false as const, error: `La nota no puede superar ${item.maxScore}` };
  }

  await prisma.grade.upsert({
    where: { gradeItemId_userId: { gradeItemId, userId } },
    create: {
      gradeItemId,
      userId,
      score,
      overridden: true,
      overriddenById: user.id,
    },
    update: {
      score,
      overridden: true,
      overriddenById: user.id,
    },
  });

  revalidatePath(`/dashboard/courses/${item.courseId}/grades`);
  return { success: true as const };
}
