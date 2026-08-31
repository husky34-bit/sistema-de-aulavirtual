'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { folderSchema } from '../schemas/folder.schema';
import { revalidatePath } from 'next/cache';

// Crea o actualiza una carpeta con referencias a StoredFile.
export async function manageFolder(input: unknown, folderId?: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const validated = folderSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, sectionId, title, fileIds, published } = validated.data;

  if (folderId) {
    const existing = await prisma.folder.findUnique({
      where: { id: folderId },
      select: { courseId: true, course: { select: { instructorId: true } } },
    });
    if (!existing) return { success: false as const, error: 'Carpeta no encontrada' };
    if (existing.course.instructorId !== user.id && user.role !== 'ADMIN') {
      return { success: false as const, error: 'No autorizado' };
    }
    await prisma.folder.update({
      where: { id: folderId },
      data: { title, fileIds, sectionId: sectionId ?? null, published },
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

  const folder = await prisma.folder.create({
    data: { courseId, sectionId: sectionId ?? null, title, fileIds, published },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true as const, folderId: folder.id };
}
