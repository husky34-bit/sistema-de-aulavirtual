'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { assignmentSchema } from '../schemas/assignment.schema';
import { revalidatePath } from 'next/cache';

// Actualiza configuración y fechas de entrega de una tarea.
export async function updateAssignment(assignmentId: string, input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, courseId: true, course: { select: { instructorId: true } } },
  });
  if (!assignment) return { success: false as const, error: 'Tarea no encontrada' };
  if (assignment.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const validated = assignmentSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const {
    title, description, instructions, maxScore,
    openAt, dueAt, cutoffAt,
    allowOnlineText, allowFiles, maxFiles, maxFileSizeMb,
    published, sectionId,
  } = validated.data;

  await prisma.$transaction(async (tx) => {
    await tx.assignment.update({
      where: { id: assignmentId },
      data: {
        title,
        description: description ?? null,
        instructions: instructions ?? null,
        maxScore,
        openAt: openAt ? new Date(openAt) : null,
        dueAt: dueAt ? new Date(dueAt) : null,
        cutoffAt: cutoffAt ? new Date(cutoffAt) : null,
        allowOnlineText,
        allowFiles,
        maxFiles,
        maxFileSizeMb,
        published,
        sectionId: sectionId ?? null,
      },
    });

    // Mantener sincronizado el GradeItem vinculado
    await tx.gradeItem.updateMany({
      where: { sourceType: 'assignment', sourceId: assignmentId },
      data: { name: title, maxScore },
    });
  });

  revalidatePath(`/dashboard/courses/${assignment.courseId}`);
  return { success: true as const };
}
