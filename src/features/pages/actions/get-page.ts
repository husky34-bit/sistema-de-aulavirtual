'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// Obtiene una página de contenido verificando acceso.
export async function getPage(pageId: string) {
  const user = await requireAuth();

  const page = await prisma.contentPage.findUnique({
    where: { id: pageId },
    include: { course: { select: { id: true, title: true, instructorId: true } }, section: { select: { title: true } } },
  });
  if (!page) return { success: false as const, error: 'Página no encontrada' };

  const isStaff = page.course.instructorId === user.id || ["ADMIN", "TEACHER", "MANAGER"].includes(user.role);
  if (!isStaff) {
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: page.courseId } },
      select: { id: true },
    });
    if (!enrolled) return { success: false as const, error: 'No autorizado' };
  }

  return { success: true as const, data: { ...page, canEdit: isStaff } };
}
