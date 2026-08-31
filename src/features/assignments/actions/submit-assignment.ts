'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { submitSchema } from '../schemas/submission.schema';
import { markComplete } from '@/features/completion/services/completion-engine';
import { revalidatePath } from 'next/cache';

// Upsert del envío del estudiante.
// Controla fechas openAt, cutoffAt y marca flag isLate si supera dueAt/extensión.
export async function submitAssignment(input: unknown) {
  const user = await requireAuth();

  const validated = submitSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { assignmentId, onlineText, mode } = validated.data;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      courseId: true,
      openAt: true,
      dueAt: true,
      cutoffAt: true,
      allowOnlineText: true,
      published: true,
    },
  });
  if (!assignment) return { success: false as const, error: 'Tarea no encontrada' };

  // Verificar que el estudiante está inscrito en el curso
  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: assignment.courseId } },
    select: { id: true },
  });
  if (!enrolled) return { success: false as const, error: 'No está inscrito en el curso' };

  const now = new Date();

  // Control de ventana de entrega
  if (mode === 'submit') {
    if (!assignment.published) {
      return { success: false as const, error: 'La tarea no está publicada' };
    }
    if (assignment.openAt && now < assignment.openAt) {
      return { success: false as const, error: 'La tarea aún no está abierta' };
    }
    // cutoffAt: si está definida, no se acepta nada después. Si no, usa dueAt.
    const hardDeadline = assignment.cutoffAt ?? assignment.dueAt;
    if (hardDeadline && now > hardDeadline) {
      // Verificar extensión individual
      const extension = await prisma.extension.findUnique({
        where: { assignmentId_userId: { assignmentId, userId: user.id } },
        select: { dueAt: true },
      });
      if (!extension || now > extension.dueAt) {
        return { success: false as const, error: 'La fecha límite de entrega ha pasado' };
      }
    }
  }

  // Calcular isLate: submittedAt > dueAt (o extensión si existe)
  const extension = await prisma.extension.findUnique({
    where: { assignmentId_userId: { assignmentId, userId: user.id } },
    select: { dueAt: true },
  });
  const effectiveDueAt = extension?.dueAt ?? assignment.dueAt;
  const isLate = mode === 'submit' && effectiveDueAt ? now > effectiveDueAt : false;

  const isSubmit = mode === 'submit';
  const status = isSubmit ? 'submitted' : 'draft';

  const submission = await prisma.submission.upsert({
    where: { assignmentId_userId: { assignmentId, userId: user.id } },
    create: {
      assignmentId,
      userId: user.id,
      onlineText: onlineText ?? null,
      status,
      submittedAt: isSubmit ? now : null,
      isLate,
    },
    update: {
      onlineText: onlineText ?? null,
      status,
      submittedAt: isSubmit ? now : undefined,
      isLate,
    },
  });

  // Marcar la tarea como completada al enviar (no al guardar borrador) (Fase 6C)
  if (isSubmit) {
    try {
      await markComplete({
        userId: user.id,
        activityType: 'assign',
        activityId: assignmentId,
        courseId: assignment.courseId,
      });
    } catch {
      // La finalización no debe romper el envío.
    }
  }

  revalidatePath(`/dashboard/courses/${assignment.courseId}/assign/${assignmentId}`);
  return { success: true as const, submissionId: submission.id };
}
