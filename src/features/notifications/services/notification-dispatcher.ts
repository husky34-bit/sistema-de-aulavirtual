// Dispatcher único de notificaciones. Punto central de creación de
// notificaciones para que todos los features (grades, messaging, forums)
// generen notificaciones de forma consistente.

import { prisma } from '@/lib/prisma';

export interface NotifyInput {
  userId: string;
  type: string; // 'submission_graded' | 'new_message' | 'quiz_opened' | 'forum_reply' | ...
  title: string;
  body?: string;
  link?: string;
}

/**
 * Crea una notificación para un usuario.
 */
export async function notify(input: NotifyInput): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    },
  });
}

/**
 * Crea la misma notificación para múltiples usuarios.
 */
export async function notifyMany(
  userIds: string[],
  input: Omit<NotifyInput, 'userId'>,
): Promise<void> {
  if (userIds.length === 0) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    })),
  });
}
