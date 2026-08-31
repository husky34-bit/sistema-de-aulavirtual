'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const groupSchema = z.object({
  courseId: z.string().min(1),
  name: z.string().min(1).max(120),
});

const autoCreateSchema = z.object({
  courseId: z.string().min(1),
  count: z.number().int().min(1).max(50).optional(),
  size: z.number().int().min(1).max(100).optional(),
});

// Lista los grupos de un curso.
export async function getGroups(courseId: string) {
  await requireAuth();
  const groups = await prisma.group.findMany({
    where: { courseId },
    include: { _count: { select: { members: true } } },
    orderBy: { name: 'asc' },
  });
  return { success: true as const, data: groups };
}

// Crea un grupo manual.
export async function manageGroup(input: unknown, groupId?: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const validated = groupSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, name } = validated.data;

  // Verificar acceso al curso
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  if (groupId) {
    await prisma.group.update({ where: { id: groupId }, data: { name } });
    return { success: true as const };
  }

  const group = await prisma.group.create({ data: { courseId, name } });
  revalidatePath(`/dashboard/courses/${courseId}/groups`);
  return { success: true as const, groupId: group.id };
}

// Crea grupos automáticamente por número o por tamaño (asignación aleatoria).
export async function autoCreateGroups(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const validated = autoCreateSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, count, size } = validated.data;
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  // Obtener estudiantes matriculados
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    select: { userId: true },
  });

  // Barajar aleatoriamente
  const shuffled = [...enrollments].sort(() => Math.random() - 0.5);
  const userIds = shuffled.map((e) => e.userId);

  let numGroups: number;
  if (count) {
    numGroups = count;
  } else if (size) {
    numGroups = Math.ceil(userIds.length / size);
  } else {
    return { success: false as const, error: 'Especifica count o size' };
  }

  // Crear grupos
  const groups = await Promise.all(
    Array.from({ length: numGroups }, (_, i) =>
      prisma.group.create({ data: { courseId, name: `Grupo ${i + 1}` } }),
    ),
  );

  // Asignar miembros
  const membersPerGroup = Math.ceil(userIds.length / numGroups);
  const memberData: { groupId: string; userId: string }[] = [];
  for (let i = 0; i < userIds.length; i++) {
    const groupIdx = size ? Math.floor(i / size) : Math.floor(i / membersPerGroup);
    const safeIdx = Math.min(groupIdx, groups.length - 1);
    memberData.push({ groupId: groups[safeIdx].id, userId: userIds[i] });
  }

  await prisma.groupMember.createMany({ data: memberData, skipDuplicates: true });

  revalidatePath(`/dashboard/courses/${courseId}/groups`);
  return { success: true as const, groupCount: numGroups };
}
