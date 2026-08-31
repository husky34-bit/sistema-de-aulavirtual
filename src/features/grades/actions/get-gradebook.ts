'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

// Retorna la matriz bidimensional completa:
// Estudiantes inscritos × Ítems de calificación, con flags de override y categorías.
export async function getGradebook(courseId: string) {
  await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const [enrollments, gradeItems, categories] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { user: { name: 'asc' } },
    }),
    prisma.gradeItem.findMany({
      where: { courseId },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { position: 'asc' },
    }),
    prisma.gradeCategory.findMany({
      where: { courseId },
      orderBy: { position: 'asc' },
    }),
  ]);

  const students = enrollments.map((e) => ({
    id: e.user.id,
    name: e.user.name,
    email: e.user.email,
  }));

  // Cargar todas las notas de los estudiantes de este curso de una vez
  const userIds = students.map((s) => s.id);
  const grades = await prisma.grade.findMany({
    where: { userId: { in: userIds }, gradeItem: { courseId } },
    select: { gradeItemId: true, userId: true, score: true, overridden: true },
  });

  // Mapa rápido: `${gradeItemId}:${userId}` -> grade
  const gradeMap = new Map<string, { score: number | null; overridden: boolean }>();
  for (const g of grades) {
    gradeMap.set(`${g.gradeItemId}:${g.userId}`, {
      score: g.score,
      overridden: g.overridden,
    });
  }

  // Construir la matriz: students × items
  const matrix = students.map((student) => ({
    student,
    cells: gradeItems.map((item) => {
      const g = gradeMap.get(`${item.id}:${student.id}`);
      return {
        gradeItemId: item.id,
        score: g?.score ?? null,
        overridden: g?.overridden ?? false,
      };
    }),
  }));

  return {
    success: true as const,
    data: {
      students,
      items: gradeItems.map((it) => ({
        id: it.id,
        name: it.name,
        maxScore: it.maxScore,
        weight: it.weight,
        categoryId: it.categoryId,
        categoryName: it.category?.name,
        sourceType: it.sourceType,
      })),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        parentId: c.parentId,
        aggregation: c.aggregation,
        position: c.position,
      })),
      matrix,
    },
  };
}
