'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

// KPIs del curso: inscritos, completadas, promedio.
export async function courseOverviewReport(courseId: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true, title: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const [enrollments, completions, grades] = await Promise.all([
    prisma.enrollment.count({ where: { courseId } }),
    prisma.activityCompletion.count({ where: { courseId, completedAt: { not: null } } }),
    prisma.grade.findMany({
      where: { gradeItem: { courseId }, score: { not: null } },
      select: { score: true },
    }),
  ]);

  const avgGrade = grades.length > 0
    ? grades.reduce((sum, g) => sum + (g.score ?? 0), 0) / grades.length
    : 0;

  return {
    success: true as const,
    data: {
      courseTitle: course.title,
      enrolled: enrollments,
      completions: completions,
      averageGrade: Math.round(avgGrade * 10) / 10,
    },
  };
}

// Matriz estudiantes × actividades (completación).
export async function activityCompletionReport(courseId: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const [enrollments, quizzes, assignments, completions] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { user: { name: 'asc' } },
    }),
    prisma.quiz.findMany({ where: { courseId }, select: { id: true, title: true }, orderBy: { title: 'asc' } }),
    prisma.assignment.findMany({ where: { courseId }, select: { id: true, title: true }, orderBy: { title: 'asc' } }),
    prisma.activityCompletion.findMany({
      where: { courseId, completedAt: { not: null } },
      select: { userId: true, activityType: true, activityId: true },
    }),
  ]);

  const completionSet = new Set(completions.map((c) => `${c.userId}:${c.activityType}:${c.activityId}`));
  const activities = [
    ...quizzes.map((q) => ({ id: q.id, type: 'quiz' as const, title: q.title })),
    ...assignments.map((a) => ({ id: a.id, type: 'assign' as const, title: a.title })),
  ];

  const matrix = enrollments.map((e) => ({
    student: { id: e.user.id, name: e.user.name ?? '', email: e.user.email },
    cells: activities.map((a) => ({
      activityId: a.id,
      title: a.title,
      completed: completionSet.has(`${e.user.id}:${a.type}:${a.id}`),
    })),
  }));

  return { success: true as const, data: { activities, matrix } };
}

// Último acceso por usuario (participación).
export async function participationReport(courseId: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { enrolledAt: 'asc' },
  });

  // Última finalización de quiz por usuario
  const lastAttempts = await prisma.quizAttempt.findMany({
    where: { quiz: { courseId }, state: 'finished' },
    select: { userId: true, finishedAt: true },
    orderBy: { finishedAt: 'desc' },
  });
  const lastByUser = new Map<string, Date>();
  for (const a of lastAttempts) {
    if (!lastByUser.has(a.userId) && a.finishedAt) {
      lastByUser.set(a.userId, a.finishedAt);
    }
  }

  return {
    success: true as const,
    data: enrollments.map((e) => ({
      student: { id: e.user.id, name: e.user.name ?? '', email: e.user.email },
      enrolledAt: e.enrolledAt,
      lastActivity: lastByUser.get(e.user.id) ?? null,
    })),
  };
}
