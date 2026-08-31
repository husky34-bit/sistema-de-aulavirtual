'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// Lista tareas del curso con contador de envíos.
export async function getAssignments(courseId: string) {
  await requireAuth();

  return prisma.assignment.findMany({
    where: { courseId },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { submissions: true } },
      section: { select: { id: true, title: true } },
    },
  });
}
