'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export async function getQuestions(courseId: string, categoryId?: string) {
  await requireAuth();

  return prisma.question.findMany({
    where: {
      category: { courseId },
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      category: { select: { id: true, name: true } },
      currentVersion: { select: { id: true, version: true, type: true, text: true, defaultScore: true, data: true } },
      versions: { orderBy: { version: 'desc' }, select: { version: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}
