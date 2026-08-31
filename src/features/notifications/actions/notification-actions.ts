'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

// Lista las notificaciones del usuario.
export async function getNotifications() {
  const user = await requireAuth();
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return { success: true as const, data: notifications };
}

// Cuenta las notificaciones no leídas.
export async function getUnreadCount() {
  const user = await requireAuth();
  const count = await prisma.notification.count({
    where: { userId: user.id, readAt: null },
  });
  return { success: true as const, count };
}

// Marca una notificación como leída.
export async function markRead(notificationId: string) {
  const user = await requireAuth();
  await prisma.notification.update({
    where: { id: notificationId, userId: user.id },
    data: { readAt: new Date() },
  });
  revalidatePath('/dashboard/notifications');
  return { success: true as const };
}

// Marca todas las notificaciones como leídas.
export async function markAllRead() {
  const user = await requireAuth();
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath('/dashboard/notifications');
  revalidatePath('/dashboard');
  return { success: true as const };
}
