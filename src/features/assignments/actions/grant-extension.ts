'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const grantExtensionSchema = z.object({
  assignmentId: z.string().min(1),
  userId: z.string().min(1),
  dueAt: z.string().datetime(),
});

// Registra o actualiza una fecha límite individual (Extension) para un estudiante.
export async function grantExtension(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const validated = grantExtensionSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { assignmentId, userId, dueAt } = validated.data;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, courseId: true, course: { select: { instructorId: true } } },
  });
  if (!assignment) return { success: false as const, error: 'Tarea no encontrada' };
  if (assignment.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  await prisma.extension.upsert({
    where: { assignmentId_userId: { assignmentId, userId } },
    create: { assignmentId, userId, dueAt: new Date(dueAt) },
    update: { dueAt: new Date(dueAt) },
  });

  revalidatePath(`/dashboard/courses/${assignment.courseId}/assign/${assignmentId}/submissions`);
  return { success: true as const };
}
