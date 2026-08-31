'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export async function getQuizById(quizId: string) {
  await requireAuth();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      course: { select: { id: true, title: true, instructorId: true } },
      questions: {
        include: {
          question: {
            select: {
              id: true,
              name: true,
              currentVersion: { select: { id: true, version: true } },
            },
          },
          questionVersion: {
            select: { id: true, version: true, type: true, text: true, data: true, defaultScore: true },
          },
        },
        orderBy: { position: 'asc' },
      },
    },
  });

  return quiz;
}
