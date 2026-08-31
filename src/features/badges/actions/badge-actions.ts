'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { countCompleted } from '@/features/completion/services/completion-engine';

const badgeSchema = z.object({
  courseId: z.string().optional().nullable(),
  name: z.string().min(3).max(120),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().optional().nullable(),
  criteria: z.record(z.string(), z.unknown()),
});

// Crea o actualiza una insignia.
export async function manageBadge(input: unknown, badgeId: string | undefined = undefined) {
  await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const validated = badgeSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, name, description, imageUrl, criteria } = validated.data;

  if (badgeId) {
    await prisma.badge.update({
      where: { id: badgeId },
      data: { name, description: description ?? null, imageUrl: imageUrl ?? null, criteria: criteria as object },
    });
    return { success: true as const };
  }

  const badge = await prisma.badge.create({
    data: {
      courseId: courseId ?? null,
      name,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      criteria: criteria as object,
    },
  });

  revalidatePath('/dashboard/badges');
  return { success: true as const, badgeId: badge.id };
}

// Otorga una insignia (manual o automática).
export async function awardBadge(badgeId: string, userId: string) {
  await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
  if (!badge) return { success: false as const, error: 'Insignia no encontrada' };

  await prisma.badgeAward.upsert({
    where: { badgeId_userId: { badgeId, userId } },
    create: { badgeId, userId },
    update: {},
  });

  revalidatePath('/dashboard/badges');
  return { success: true as const };
}

/**
 * Verifica y otorga automáticamente insignias con criterio 'completion'.
 * Llamar después de marcar una actividad como completada.
 */
export async function checkAndAwardCompletionBadges(userId: string, courseId: string): Promise<void> {
  const badges = await prisma.badge.findMany({
    where: { courseId, criteria: { path: ['type'], equals: 'completion' } },
  });

  for (const badge of badges) {
    const criteria = badge.criteria as { type: string; courseId: string };
    if (criteria.type === 'completion' && criteria.courseId === courseId) {
      const { completed, total } = await countCompleted(userId, courseId);
      if (total > 0 && completed >= total) {
        await prisma.badgeAward.upsert({
          where: { badgeId_userId: { badgeId: badge.id, userId } },
          create: { badgeId: badge.id, userId },
          update: {},
        });
      }
    }
  }
}

// Obtiene las insignias del usuario.
export async function getUserBadges() {
  const user = await requireAuth();
  const awards = await prisma.badgeAward.findMany({
    where: { userId: user.id },
    include: { badge: { select: { id: true, name: true, description: true, imageUrl: true } } },
    orderBy: { awardedAt: 'desc' },
  });
  return { success: true as const, data: awards };
}

// Lista todas las insignias (para gestión).
export async function getAllBadges() {
  await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const badges = await prisma.badge.findMany({
    include: { _count: { select: { awards: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return { success: true as const, data: badges };
}
