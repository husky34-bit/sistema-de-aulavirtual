'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// Exporta todos los datos del usuario actual como JSON (privacidad/GDPR).
export async function exportUserData() {
  const user = await requireAuth();

  const [profile, enrollments, submissions, grades, messages, completions, badges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: { course: { select: { title: true } } },
    }),
    prisma.submission.findMany({
      where: { userId: user.id },
      select: { id: true, assignmentId: true, status: true, score: true, feedback: true, submittedAt: true, isLate: true },
    }),
    prisma.grade.findMany({
      where: { userId: user.id },
      select: { id: true, score: true, overridden: true, gradeItem: { select: { name: true } } },
    }),
    prisma.message.findMany({
      where: { senderId: user.id },
      select: { id: true, content: true, createdAt: true },
    }),
    prisma.activityCompletion.findMany({
      where: { userId: user.id },
      select: { activityType: true, activityId: true, completedAt: true },
    }),
    prisma.badgeAward.findMany({
      where: { userId: user.id },
      include: { badge: { select: { name: true } } },
    }),
  ]);

  return {
    profile,
    enrollments: enrollments.map((e) => ({ courseId: e.courseId, courseTitle: e.course.title, enrolledAt: e.enrolledAt })),
    submissions,
    grades: grades.map((g) => ({ id: g.id, score: g.score, overridden: g.overridden, itemName: g.gradeItem.name })),
    messages: messages.map((m) => ({ id: m.id, content: m.content, createdAt: m.createdAt })),
    completions,
    badges: badges.map((b) => ({ name: b.badge.name, awardedAt: b.awardedAt })),
  };
}
