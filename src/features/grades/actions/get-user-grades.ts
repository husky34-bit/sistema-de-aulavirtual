'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { computeCourseGrade } from '../services/grade-calculator';

// Genera la boleta consolidada de calificaciones de un estudiante en todos sus
// cursos, con el total calculado por curso.
export async function getUserGrades() {
  const user = await requireAuth();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          instructor: { select: { name: true } },
        },
      },
    },
    orderBy: { course: { title: 'asc' } },
  });

  const result = await Promise.all(
    enrollments.map(async (e) => {
      const items = await prisma.gradeItem.findMany({
        where: { courseId: e.courseId },
        orderBy: { position: 'asc' },
        include: { category: { select: { name: true } } },
      });

      const grades = await prisma.grade.findMany({
        where: { userId: user.id, gradeItem: { courseId: e.courseId } },
        select: { gradeItemId: true, score: true, overridden: true },
      });
      const gradeMap = new Map(grades.map((g) => [g.gradeItemId, g]));

      const total = await computeCourseGrade(e.courseId, user.id);

      return {
        courseId: e.course.id,
        courseTitle: e.course.title,
        instructorName: e.course.instructor.name,
        total: total.value,
        items: items.map((it) => {
          const g = gradeMap.get(it.id);
          const fraction =
            g?.score !== null && g?.score !== undefined && it.maxScore > 0
              ? g.score / it.maxScore
              : null;
          return {
            id: it.id,
            name: it.name,
            maxScore: it.maxScore,
            score: g?.score ?? null,
            fraction,
            overridden: g?.overridden ?? false,
            categoryName: it.category?.name,
          };
        }),
      };
    }),
  );

  return { success: true as const, data: result };
}
