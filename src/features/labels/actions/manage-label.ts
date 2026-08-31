'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { labelSchema } from '../schemas/label.schema';
import { sanitizeHtml } from '@/features/filters/services/sanitize';
import { revalidatePath } from 'next/cache';

// Crea o actualiza una etiqueta decorativa dentro de una sección.
export async function manageLabel(input: unknown, labelId?: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const validated = labelSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, sectionId, content } = validated.data;
  const safeContent = sanitizeHtml(content);

  if (labelId) {
    const existing = await prisma.label.findUnique({
      where: { id: labelId },
      select: { courseId: true, course: { select: { instructorId: true } } },
    });
    if (!existing) return { success: false as const, error: 'Etiqueta no encontrada' };
    if (existing.course.instructorId !== user.id && user.role !== 'ADMIN') {
      return { success: false as const, error: 'No autorizado' };
    }
    await prisma.label.update({
      where: { id: labelId },
      data: { content: safeContent, sectionId: sectionId ?? null },
    });
    revalidatePath(`/dashboard/courses/${existing.courseId}`);
    return { success: true as const };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const label = await prisma.label.create({
    data: { courseId, sectionId: sectionId ?? null, content: safeContent },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true as const, labelId: label.id };
}
