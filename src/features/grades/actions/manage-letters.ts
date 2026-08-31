'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { gradeLetterSchema } from '../schemas/grade.schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const manageLettersInput = z.object({
  courseId: z.string().min(1),
  letters: z.array(gradeLetterSchema).min(1),
});

// Configuración de letras equivalentes (A, B, C, F) por porcentaje.
// Reemplaza las letras existentes del curso por las recibidas.
export async function manageLetters(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const validated = manageLettersInput.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, letters } = validated.data;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  await prisma.$transaction([
    prisma.gradeLetter.deleteMany({ where: { courseId } }),
    ...letters.map((l) =>
      prisma.gradeLetter.create({
        data: {
          courseId,
          letter: l.letter,
          minPercent: l.minPercent,
          description: l.description ?? null,
        },
      }),
    ),
  ]);

  revalidatePath(`/dashboard/courses/${courseId}/grades/setup`);
  return { success: true as const };
}

// Convierte un porcentaje a letra
export function scoreToLetter(pct: number, letters: { letter: string; minPercent: number }[]): string {
  const sorted = [...letters].sort((a, b) => b.minPercent - a.minPercent);
  for (const l of sorted) {
    if (pct >= l.minPercent) return l.letter;
  }
  return sorted[sorted.length - 1]?.letter ?? '—';
}
