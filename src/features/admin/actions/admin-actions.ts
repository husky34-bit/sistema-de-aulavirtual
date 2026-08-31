'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const settingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(5000),
});

// Obtiene todas las configuraciones del sitio.
export async function getSiteSettings() {
  await requireRole(['ADMIN']);
  const settings = await prisma.siteSetting.findMany();
  return { success: true as const, data: settings };
}

// Crea o actualiza una configuración.
export async function saveSetting(input: unknown) {
  await requireRole(['ADMIN']);
  const validated = settingSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { key, value } = validated.data;
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });

  revalidatePath('/admin/settings');
  return { success: true as const };
}

// Obtiene los logs de auditoría (filtrables).
export async function getAuditLogs(filterUserId?: string, filterAction?: string) {
  await requireRole(['ADMIN']);
  const logs = await prisma.auditLog.findMany({
    where: {
      ...(filterUserId ? { userId: filterUserId } : {}),
      ...(filterAction ? { action: filterAction } : {}),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return { success: true as const, data: logs };
}
