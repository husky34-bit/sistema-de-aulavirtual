'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { urlSchema } from '../schemas/url.schema';
import { revalidatePath } from 'next/cache';

// Crea o actualiza un recurso URL externo.
export async function manageUrl(input: unknown, urlId?: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const validated = urlSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, sectionId, title, url, published } = validated.data;

  if (urlId) {
    const existing = await prisma.urlResource.findUnique({
      where: { id: urlId },
      select: { courseId: true, course: { select: { instructorId: true } } },
    });
    if (!existing) return { success: false as const, error: 'URL no encontrada' };
    if (existing.course.instructorId !== user.id && user.role !== 'ADMIN') {
      return { success: false as const, error: 'No autorizado' };
    }
    await prisma.urlResource.update({
      where: { id: urlId },
      data: { title, url, sectionId: sectionId ?? null, published },
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

  const created = await prisma.urlResource.create({
    data: { courseId, sectionId: sectionId ?? null, title, url, published },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true as const, urlId: created.id };
}
