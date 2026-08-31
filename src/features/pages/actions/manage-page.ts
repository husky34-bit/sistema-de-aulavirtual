'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { pageSchema } from '../schemas/page.schema';
import { sanitizeHtml } from '@/features/filters/services/sanitize';
import { revalidatePath } from 'next/cache';

// Crea una página de contenido sanitizando el HTML.
export async function createPage(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const validated = pageSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, sectionId, title, content, published } = validated.data;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const page = await prisma.contentPage.create({
    data: {
      courseId,
      sectionId: sectionId ?? null,
      title,
      content: sanitizeHtml(content),
      published,
    },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true as const, pageId: page.id };
}

// Actualiza el contenido (re-sanitiza en cada guardado).
export async function updatePage(pageId: string, input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const validated = pageSchema.partial({ courseId: true }).safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const page = await prisma.contentPage.findUnique({
    where: { id: pageId },
    select: { courseId: true, course: { select: { instructorId: true } } },
  });
  if (!page) return { success: false as const, error: 'Página no encontrada' };
  if (page.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const { title, content, sectionId, published } = validated.data;
  await prisma.contentPage.update({
    where: { id: pageId },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content: sanitizeHtml(content) }),
      ...(sectionId !== undefined && { sectionId: sectionId ?? null }),
      ...(published !== undefined && { published }),
    },
  });

  revalidatePath(`/dashboard/courses/${page.courseId}`);
  return { success: true as const };
}
