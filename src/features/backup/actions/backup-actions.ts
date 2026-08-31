'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { serializeCourse } from '../services/backup-serializer';
import { restoreCourse } from '../services/restore-deserializer';
import type { CourseBackup } from '../services/backup-serializer';

// Exporta un curso a JSON.
export async function exportCourseBackup(courseId: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const backup = await serializeCourse(courseId);
  return { success: true as const, backup };
}

// Importa un curso desde un JSON de respaldo.
export async function importCourseBackup(backupJson: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  try {
    const backup = JSON.parse(backupJson) as CourseBackup;
    const newCourseId = await restoreCourse(backup, user.id);
    return { success: true as const, courseId: newCourseId };
  } catch {
    return { success: false as const, error: 'JSON de respaldo inválido' };
  }
}
