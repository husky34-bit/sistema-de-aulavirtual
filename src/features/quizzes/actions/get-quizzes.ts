'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export async function getQuizzes(courseId: string) {
  await requireAuth();

  return prisma.quiz.findMany({
    where: { courseId },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: { questions: true, attempts: true },
      },
    },
  });
}
