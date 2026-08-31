'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { gradeScaleSchema } from '../schemas/grade.schema';
import { revalidatePath } from 'next/cache';

// Creación/actualización de escalas de desempeño (Sobresaliente, Notable, etc.).
// Si se recibe `scaleId`, actualiza la escala y sus ítems (reemplazo completo).
export async function manageScales(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const validated = gradeScaleSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, name, description, items } = validated.data;

  if (courseId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, instructorId: true },
    });
    if (!course) return { success: false as const, error: 'Curso no encontrado' };
    if (course.instructorId !== user.id && user.role !== 'ADMIN') {
      return { success: false as const, error: 'No autorizado' };
    }
  }

  const scale = await prisma.gradeScale.create({
    data: {
      courseId: courseId ?? null,
      name,
      description: description ?? null,
      items: {
        create: items.map((it) => ({
          name: it.name,
          minPercent: it.minPercent,
          description: it.description ?? null,
        })),
      },
    },
  });

  revalidatePath(`/dashboard/courses/${courseId ?? ''}/grades/setup`);
  return { success: true as const, scaleId: scale.id };
}
