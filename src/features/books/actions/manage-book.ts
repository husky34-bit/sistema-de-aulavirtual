'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import { bookSchema, chapterSchema } from '../schemas/book.schema';
import { sanitizeHtml } from '@/features/filters/services/sanitize';
import { revalidatePath } from 'next/cache';

// Crea un libro vacío.
export async function createBook(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const validated = bookSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, sectionId, title, published } = validated.data;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const book = await prisma.book.create({
    data: { courseId, sectionId: sectionId ?? null, title, published },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true as const, bookId: book.id };
}

// Añade, actualiza o elimina capítulos en una transacción.
export async function manageChapters(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const validated = chapterSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { bookId, title, content, position } = validated.data;

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { courseId: true, course: { select: { instructorId: true } } },
  });
  if (!book) return { success: false as const, error: 'Libro no encontrado' };
  if (book.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const pos = position ?? (await prisma.bookChapter.count({ where: { bookId } }));
  await prisma.bookChapter.create({
    data: { bookId, title, content: sanitizeHtml(content), position: pos },
  });

  revalidatePath(`/dashboard/courses/${book.courseId}`);
  return { success: true as const };
}

// Obtiene un libro con todos sus capítulos ordenados.
export async function getBook(bookId: string) {
  await requireAuth();
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: { chapters: { orderBy: { position: 'asc' } }, course: { select: { id: true, title: true } } },
  });
  if (!book) return { success: false as const, error: 'Libro no encontrado' };
  return { success: true as const, data: book };
}
