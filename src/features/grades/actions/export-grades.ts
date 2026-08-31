'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { computeCourseGrade } from '../services/grade-calculator';

// Generación de la matriz de notas en formato CSV.
// Retorna el string CSV para que el cliente lo descargue como blob.
export async function exportGrades(courseId: string): Promise<{ success: true; csv: string; filename: string } | { success: false; error: string }> {
  await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };

  const [enrollments, gradeItems] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { user: { name: 'asc' } },
    }),
    prisma.gradeItem.findMany({
      where: { courseId },
      orderBy: { position: 'asc' },
      select: { id: true, name: true, maxScore: true },
    }),
  ]);

  const grades = await prisma.grade.findMany({
    where: { userId: { in: enrollments.map((e) => e.user.id) }, gradeItem: { courseId } },
    select: { gradeItemId: true, userId: true, score: true },
  });
  const gradeMap = new Map(grades.map((g) => [`${g.gradeItemId}:${g.userId}`, g.score]));

  // Cabecera del CSV
  const header = [
    'Estudiante',
    'Email',
    ...gradeItems.map((it) => `${it.name} /${it.maxScore}`),
    'Total /100',
  ];

  const rows: string[] = [header.map(csvEscape).join(',')];

  for (const e of enrollments) {
    const row: string[] = [e.user.name ?? '', e.user.email ?? ''];
    for (const it of gradeItems) {
      const score = gradeMap.get(`${it.id}:${e.user.id}`) ?? null;
      row.push(score === null ? '' : String(score));
    }
    const total = await computeCourseGrade(courseId, e.user.id);
    row.push(total.value === null ? '' : total.value.toFixed(2));
    rows.push(row.map(csvEscape).join(','));
  }

  const csv = rows.join('\r\n');
  const filename = `gradebook-${course.title.replace(/\s+/g, '-').toLowerCase()}.csv`;
  return { success: true as const, csv, filename };
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
