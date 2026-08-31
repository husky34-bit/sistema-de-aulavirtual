'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { gradeCategorySchema, updateAggregationSchema } from '../schemas/grade.schema';
import { revalidatePath } from 'next/cache';

// Creación de categorías de calificación (puede anidarse en parentId).
export async function createGradeCategory(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const validated = gradeCategorySchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, name, parentId, aggregation, position } = validated.data;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  if (parentId) {
    const parent = await prisma.gradeCategory.findUnique({
      where: { id: parentId },
      select: { courseId: true },
    });
    if (!parent || parent.courseId !== courseId) {
      return { success: false as const, error: 'Categoría padre inválida' };
    }
  }

  const category = await prisma.gradeCategory.create({
    data: {
      courseId,
      name,
      parentId: parentId ?? null,
      aggregation,
      position,
    },
  });

  revalidatePath(`/dashboard/courses/${courseId}/grades/setup`);
  return { success: true as const, categoryId: category.id };
}

// Cambio del método de agregación de una categoría existente.
export async function updateAggregation(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const validated = updateAggregationSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { categoryId, aggregation } = validated.data;

  const category = await prisma.gradeCategory.findUnique({
    where: { id: categoryId },
    select: { id: true, courseId: true, course: { select: { instructorId: true } } },
  });
  if (!category) return { success: false as const, error: 'Categoría no encontrada' };
  if (category.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  await prisma.gradeCategory.update({
    where: { id: categoryId },
    data: { aggregation },
  });

  revalidatePath(`/dashboard/courses/${category.courseId}/grades/setup`);
  return { success: true as const };
}
