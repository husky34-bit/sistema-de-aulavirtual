'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { gradeSubmissionSchema } from '../schemas/submission.schema';
import { syncGradeToGradebook } from '@/features/grades/services/grade-sync';
import { notify } from '@/features/notifications/services/notification-dispatcher';
import { revalidatePath } from 'next/cache';

// Guarda nota y feedback del docente, cambia estado a graded y sincroniza
// con el Gradebook.
export async function gradeSubmission(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const validated = gradeSubmissionSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { submissionId, score, feedback } = validated.data;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      assignmentId: true,
      userId: true,
      assignment: { select: { id: true, courseId: true, maxScore: true, course: { select: { instructorId: true } } } },
    },
  });
  if (!submission) return { success: false as const, error: 'Envío no encontrado' };
  if (submission.assignment.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  if (score > submission.assignment.maxScore) {
    return { success: false as const, error: `La nota no puede superar ${submission.assignment.maxScore}` };
  }

  const now = new Date();
  const maxScore = submission.assignment.maxScore;

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      score,
      feedback: feedback ?? null,
      status: 'graded',
      gradedById: user.id,
      gradedAt: now,
    },
  });

  // Sincronizar con el Gradebook (fracción 0..1)
  const fraction = maxScore > 0 ? score / maxScore : 0;
  try {
    await syncGradeToGradebook({
      courseId: submission.assignment.courseId,
      sourceType: 'assignment',
      sourceId: submission.assignment.id,
      userId: submission.userId,
      score: fraction,
    });
  } catch {
    // La sincronización no debe romper la calificación.
  }

  // Notificar al estudiante que su tarea fue calificada
  try {
    await notify({
      userId: submission.userId,
      type: 'submission_graded',
      title: 'Tu tarea fue calificada',
      body: `Nota: ${score}/${maxScore}`,
      link: `/dashboard/courses/${submission.assignment.courseId}/assign/${submission.assignmentId}`,
    });
  } catch {
    // La notificación no debe romper la calificación.
  }

  revalidatePath(`/dashboard/courses/${submission.assignment.courseId}/assign/${submission.assignmentId}/submissions`);
  revalidatePath(`/dashboard/courses/${submission.assignment.courseId}/grades`);
  return { success: true as const };
}
