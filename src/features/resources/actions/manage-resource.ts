'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { resourceSchema } from '../schemas/resource.schema';
import { revalidatePath } from 'next/cache';

// Crea un recurso vinculado a un StoredFile en el gradebook del curso.
export async function createResource(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const validated = resourceSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, sectionId, title, fileId, published } = validated.data;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const resource = await prisma.resource.create({
    data: { courseId, sectionId: sectionId ?? null, title, fileId, published },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true as const, resourceId: resource.id };
}

// Actualiza título, sección y publicación del recurso.
export async function updateResource(resourceId: string, input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const validated = resourceSchema.partial({ fileId: true }).safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { courseId: true, course: { select: { instructorId: true } } },
  });
  if (!resource) return { success: false as const, error: 'Recurso no encontrado' };
  if (resource.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const { title, sectionId, published } = validated.data;
  await prisma.resource.update({
    where: { id: resourceId },
    data: {
      ...(title !== undefined && { title }),
      ...(sectionId !== undefined && { sectionId: sectionId ?? null }),
      ...(published !== undefined && { published }),
    },
  });

  revalidatePath(`/dashboard/courses/${resource.courseId}`);
  return { success: true as const };
}

// Elimina el recurso (no el archivo subyacente).
export async function deleteResource(resourceId: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { courseId: true, course: { select: { instructorId: true } } },
  });
  if (!resource) return { success: false as const, error: 'Recurso no encontrado' };
  if (resource.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  await prisma.resource.delete({ where: { id: resourceId } });
  revalidatePath(`/dashboard/courses/${resource.courseId}`);
  return { success: true as const };
}
