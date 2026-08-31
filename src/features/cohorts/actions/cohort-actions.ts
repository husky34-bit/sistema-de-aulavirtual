'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const cohortSchema = z.object({
  name: z.string().min(1).max(120),
});

const addMembersSchema = z.object({
  cohortId: z.string().min(1),
  userIds: z.array(z.string()),
});

// Lista todas las cohortes.
export async function getCohorts() {
  await requireRole(['ADMIN', 'MANAGER']);
  const cohorts = await prisma.cohort.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { name: 'asc' },
  });
  return { success: true as const, data: cohorts };
}

// Crea una cohorte.
export async function manageCohort(input: unknown, cohortId?: string) {
  await requireRole(['ADMIN', 'MANAGER']);
  const validated = cohortSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { name } = validated.data;
  if (cohortId) {
    await prisma.cohort.update({ where: { id: cohortId }, data: { name } });
    return { success: true as const };
  }

  const cohort = await prisma.cohort.create({ data: { name } });
  revalidatePath('/admin/cohorts');
  return { success: true as const, cohortId: cohort.id };
}

// Añade miembros a una cohorte.
export async function addMembers(input: unknown) {
  await requireRole(['ADMIN', 'MANAGER']);
  const validated = addMembersSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { cohortId, userIds } = validated.data;
  await prisma.cohortMember.createMany({
    data: userIds.map((userId) => ({ cohortId, userId })),
    skipDuplicates: true,
  });

  revalidatePath('/admin/cohorts');
  return { success: true as const };
}

// Sube miembros vía CSV. Retorna preview con errores por fila.
export async function uploadCohortCsv(cohortId: string, csvText: string) {
  await requireRole(['ADMIN', 'MANAGER']);

  const lines = csvText.trim().split('\n');
  const results: { row: number; email: string; status: 'ok' | 'error'; message?: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const email = lines[i].trim();
    if (!email) continue;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      results.push({ row: i + 1, email, status: 'error', message: 'Usuario no encontrado' });
      continue;
    }

    await prisma.cohortMember.upsert({
      where: { cohortId_userId: { cohortId, userId: user.id } },
      create: { cohortId, userId: user.id },
      update: {},
    });
    results.push({ row: i + 1, email, status: 'ok' });
  }

  revalidatePath('/admin/cohorts');
  return { success: true as const, results };
}

// Sincroniza una cohorte con matrículas de un curso.
export async function cohortSync(cohortId: string, courseId: string) {
  await requireRole(['ADMIN', 'MANAGER']);
  const members = await prisma.cohortMember.findMany({
    where: { cohortId },
    select: { userId: true },
  });

  await prisma.enrollment.createMany({
    data: members.map((m) => ({ userId: m.userId, courseId })),
    skipDuplicates: true,
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true as const, enrolled: members.length };
}
