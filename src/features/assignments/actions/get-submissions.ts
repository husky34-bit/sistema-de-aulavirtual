'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

// Lista de envíos por tarea para el docente con cálculo de entregas fuera de plazo.
export async function getSubmissions(assignmentId: string) {
  await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      courseId: true,
      title: true,
      maxScore: true,
      dueAt: true,
      cutoffAt: true,
    },
  });
  if (!assignment) return { success: false as const, error: 'Tarea no encontrada' };

  const submissions = await prisma.submission.findMany({
    where: { assignmentId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      gradedBy: { select: { id: true, name: true } },
      files: {
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          sizeBytes: true,
          mimeType: true,
        },
      },
    },
    orderBy: { submittedAt: 'asc' },
  });

  return {
    success: true as const,
    data: {
      assignment,
      submissions: submissions.map((s) => ({
        id: s.id,
        userId: s.userId,
        userName: s.user.name,
        userEmail: s.user.email,
        onlineText: s.onlineText,
        files: s.files,
        status: s.status,
        submittedAt: s.submittedAt,
        isLate: s.isLate,
        score: s.score,
        feedback: s.feedback,
        gradedByName: s.gradedBy?.name,
        gradedAt: s.gradedAt,
      })),
    },
  };
}
