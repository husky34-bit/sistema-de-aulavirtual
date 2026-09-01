'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export async function getTeacherGradebookOverview() {
  const user = await requireAuth();

  const isGlobalAdmin = user.role === 'ADMIN' || user.role === 'MANAGER';

  const courses = await prisma.course.findMany({
    where: isGlobalAdmin
      ? {}
      : { instructorId: user.id },
    include: {
      instructor: { select: { name: true } },
      _count: {
        select: {
          enrollments: true,
          assignments: true,
          quizzes: true,
          sections: true,
        },
      },
    },
    orderBy: { title: 'asc' },
  });

  const pendingList = await Promise.all(
    courses.map(async (c) => {
      const pending = await prisma.submission.count({
        where: {
          assignment: { courseId: c.id },
          status: 'submitted',
        },
      });
      return { courseId: c.id, pending };
    })
  );

  const pendingMap = new Map(pendingList.map((p) => [p.courseId, p.pending]));

  return {
    success: true as const,
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      code: c.slug,
      area: c.area,
      instructorName: c.instructor.name,
      studentsCount: c._count.enrollments,
      assignmentsCount: c._count.assignments,
      quizzesCount: c._count.quizzes,
      pendingCount: pendingMap.get(c.id) ?? 0,
    })),
  };
}
