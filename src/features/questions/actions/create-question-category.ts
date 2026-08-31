'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

export async function createQuestionCategory(courseId: string, name: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  if (!name.trim()) return { success: false as const, error: 'Nombre requerido' };

  await prisma.questionCategory.create({
    data: { courseId, name: name.trim() },
  });

  revalidatePath(`/dashboard/courses/${courseId}/questions`);
  return { success: true as const };
}
