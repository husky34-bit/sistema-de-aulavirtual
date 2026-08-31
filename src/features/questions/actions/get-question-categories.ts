'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export async function getQuestionCategories(courseId: string) {
  await requireAuth();
  return prisma.questionCategory.findMany({
    where: { courseId },
    include: { _count: { select: { questions: true } } },
    orderBy: { name: 'asc' },
  });
}
