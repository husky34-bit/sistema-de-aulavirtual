'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export type ReportSource = 'users' | 'enrollments' | 'grades' | 'quizzes';

export interface ReportOutput {
  columns: string[];
  rows: Record<string, string | number | null>[];
}

export async function runReport(
  source: ReportSource,
  filters: Record<string, string> = {}
): Promise<{ success: boolean; data?: ReportOutput; error?: string }> {
  await requireAuth();

  try {
    switch (source) {
      case 'users': {
        const users = await prisma.user.findMany({
          where: filters.role ? { role: filters.role as never } : {},
          select: {
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        });

        return {
          success: true,
          data: {
            columns: ['Nombre', 'Correo', 'Rol', 'Fecha Registro'],
            rows: users.map((u) => ({
              Nombre: u.name,
              Correo: u.email,
              Rol: u.role,
              'Fecha Registro': u.createdAt.toISOString().slice(0, 10),
            })),
          },
        };
      }

      case 'enrollments': {
        const enrollments = await prisma.enrollment.findMany({
          where: filters.courseId ? { courseId: filters.courseId } : {},
          include: {
            user: { select: { name: true, email: true } },
            course: { select: { title: true } },
          },
          orderBy: { enrolledAt: 'desc' },
          take: 100,
        });

        return {
          success: true,
          data: {
            columns: ['Estudiante', 'Correo', 'Curso', 'Fecha Matrícula'],
            rows: enrollments.map((e) => ({
              Estudiante: e.user.name,
              Correo: e.user.email,
              Curso: e.course.title,
              'Fecha Matrícula': e.enrolledAt.toISOString().slice(0, 10),
            })),
          },
        };
      }

      case 'grades': {
        const grades = await prisma.grade.findMany({
          where: filters.courseId ? { gradeItem: { courseId: filters.courseId } } : {},
          include: {
            user: { select: { name: true } },
            gradeItem: { select: { name: true, maxScore: true } },
          },
          take: 100,
        });

        return {
          success: true,
          data: {
            columns: ['Estudiante', 'Actividad', 'Calificación', 'Puntaje Máximo', 'Sobrescrita'],
            rows: grades.map((g) => ({
              Estudiante: g.user.name,
              Actividad: g.gradeItem.name,
              Calificación: g.score !== null ? `${g.score.toFixed(1)}` : 'Sin calificar',
              'Puntaje Máximo': g.gradeItem.maxScore,
              Sobrescrita: g.overridden ? 'Sí' : 'No',
            })),
          },
        };
      }

      case 'quizzes': {
        const attempts = await prisma.quizAttempt.findMany({
          where: filters.quizId ? { quizId: filters.quizId } : {},
          include: {
            user: { select: { name: true } },
            quiz: { select: { title: true } },
          },
          orderBy: { startedAt: 'desc' },
          take: 100,
        });

        return {
          success: true,
          data: {
            columns: ['Estudiante', 'Cuestionario', 'Intento #', 'Estado', 'Puntaje', 'Nota %'],
            rows: attempts.map((a) => {
              const pct =
                a.totalScore !== null && a.maxScore && a.maxScore > 0
                  ? `${((a.totalScore / a.maxScore) * 100).toFixed(1)}%`
                  : '—';

              return {
                Estudiante: a.user.name,
                Cuestionario: a.quiz.title,
                'Intento #': a.attemptNumber,
                Estado: a.state === 'finished' ? 'Finalizado' : 'En progreso',
                Puntaje: a.totalScore !== null ? `${a.totalScore.toFixed(1)} / ${a.maxScore ?? 0}` : '—',
                'Nota %': pct,
              };
            }),
          },
        };
      }

      default:
        return { success: false, error: 'Fuente de reporte no válida' };
    }
  } catch (error) {
    console.error('Error running report builder:', error);
    return { success: false, error: 'Error al generar el reporte' };
  }
}
