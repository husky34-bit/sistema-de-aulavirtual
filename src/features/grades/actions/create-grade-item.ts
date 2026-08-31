'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { gradeItemSchema } from '../schemas/grade.schema';
import { revalidatePath } from 'next/cache';

// Creación de ítems manuales (ej: "Participación", "Examen Oral").
export async function createGradeItem(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const validated = gradeItemSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, name, maxScore, weight, categoryId, position } = validated.data;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const item = await prisma.gradeItem.create({
    data: {
      courseId,
      name,
      maxScore,
      weight,
      categoryId: categoryId ?? null,
      position,
    },
  });

  revalidatePath(`/dashboard/courses/${courseId}/grades`);
  return { success: true as const, gradeItemId: item.id };
}
