'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { assignmentSchema } from '../schemas/assignment.schema';
import { syncAssignmentEvents } from '@/features/calendar/services/event-generator';
import { revalidatePath } from 'next/cache';

// Crea la tarea y automáticamente inserta su GradeItem vinculado en el Gradebook.
export async function createAssignment(courseId: string, input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
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

  const assignment = await prisma.$transaction(async (tx) => {
    const assign = await tx.assignment.create({
      data: {
        courseId,
        sectionId: sectionId ?? null,
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
      },
    });

    // Crear el GradeItem vinculado (sourceType=assignment) en el gradebook.
    await tx.gradeItem.create({
      data: {
        courseId,
        name: title,
        maxScore,
        weight: 1,
        sourceType: 'assignment',
        sourceId: assign.id,
        position: 0,
      },
    });

    return assign;
  });

  // Generar evento de calendario automático (Fase 6B)
  try {
    await syncAssignmentEvents(assignment.id, courseId, title, dueAt ? new Date(dueAt) : null);
  } catch {
    // El calendario no debe romper la creación de la tarea.
  }

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true as const, assignmentId: assignment.id };
}
