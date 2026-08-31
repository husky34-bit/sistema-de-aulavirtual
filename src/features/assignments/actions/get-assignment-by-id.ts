'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// Obtiene una tarea por id, incluyendo su envío del usuario actual (si existe).
export async function getAssignmentById(assignmentId: string) {
  const user = await requireAuth();

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      section: { select: { id: true, title: true } },
      course: { select: { id: true, title: true, instructorId: true } },
    },
  });
  if (!assignment) return { success: false as const, error: 'Tarea no encontrada' };

  // Verificar acceso: instructor/admin o inscrito
  const isStaff = assignment.course.instructorId === user.id || ["ADMIN", "TEACHER", "MANAGER"].includes(user.role);
  if (!isStaff) {
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: assignment.courseId } },
      select: { id: true },
    });
    if (!enrolled) return { success: false as const, error: 'No autorizado' };
  }

  // Envío del usuario actual
  const mySubmission = await prisma.submission.findUnique({
    where: { assignmentId_userId: { assignmentId, userId: user.id } },
    select: {
      id: true,
      onlineText: true,
      status: true,
      submittedAt: true,
      isLate: true,
      score: true,
      feedback: true,
      gradedAt: true,
      files: {
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          sizeBytes: true,
          mimeType: true,
          uploadedAt: true,
        },
      },
    },
  });

  // Extensión individual del usuario actual (si existe)
  const myExtension = await prisma.extension.findUnique({
    where: { assignmentId_userId: { assignmentId, userId: user.id } },
    select: { dueAt: true },
  });

  return {
    success: true as const,
    data: {
      ...assignment,
      canEdit: isStaff,
      mySubmission,
      myExtension,
    },
  };
}
