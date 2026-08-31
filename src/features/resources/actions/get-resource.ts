'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// Obtiene un recurso por id, verificando acceso del usuario.
export async function getResource(resourceId: string) {
  const user = await requireAuth();

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: {
      file: true,
      course: { select: { id: true, title: true, instructorId: true } },
      section: { select: { id: true, title: true } },
    },
  });
  if (!resource) return { success: false as const, error: 'Recurso no encontrado' };

  const isStaff = resource.course.instructorId === user.id || ["ADMIN", "TEACHER", "MANAGER"].includes(user.role);
  if (!isStaff) {
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: resource.courseId } },
      select: { id: true },
    });
    if (!enrolled) return { success: false as const, error: 'No autorizado' };
  }

  return { success: true as const, data: { ...resource, canEdit: isStaff } };
}
