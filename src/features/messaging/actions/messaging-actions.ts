'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { notifyMany } from '@/features/notifications/services/notification-dispatcher';
import { revalidatePath } from 'next/cache';

// Lista las conversaciones del usuario con último mensaje y contador de no leídos.
export async function getConversations() {
  const user = await requireAuth();

  const memberships = await prisma.conversationMember.findMany({
    where: { userId: user.id },
    include: {
      conversation: {
        include: {
          course: { select: { title: true } },
          members: { include: { user: { select: { id: true, name: true } } } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      },
    },
    orderBy: { conversation: { createdAt: 'desc' } },
  });

  const result = memberships.map((m) => {
    const lastMessage = m.conversation.messages[0];
    const otherMembers = m.conversation.members.filter((mem) => mem.userId !== user.id);
    const unreadCount = lastMessage && m.lastReadAt && lastMessage.createdAt > m.lastReadAt ? 1 : 0;

    return {
      id: m.conversation.id,
      otherUserName: otherMembers[0]?.user.name ?? 'Conversación',
      otherUserId: otherMembers[0]?.userId ?? '',
      lastMessage: lastMessage?.content ?? '',
      lastMessageAt: lastMessage?.createdAt ?? m.conversation.createdAt,
      unreadCount,
      courseTitle: m.conversation.course?.title ?? null,
    };
  });

  return { success: true as const, data: result };
}

// Envía un mensaje. Crea la conversación 1:1 si no existe.
export async function sendMessage(recipientId: string, content: string) {
  void recipientId;
  void content;
  await requireAuth();
  // Las nuevas conversaciones se crean exclusivamente desde Participantes del curso.
  // Esto impide que un identificador técnico evite la regla de privacidad elegida.
  return {
    success: false as const,
    error: 'Inicia una conversación desde Participantes dentro de un curso.',
  };
}

// Obtiene los mensajes de una conversación (paginado simple).
export async function getMessages(conversationId: string, take = 50, skip = 0) {
  const user = await requireAuth();

  // Verificar que el usuario es miembro
  const membership = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
    select: { id: true },
  });
  if (!membership) return { success: false as const, error: 'No autorizado' };

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
    take,
    skip,
  });

  return { success: true as const, data: messages };
}

// Envía un mensaje a una conversación existente.
export async function sendMessageToConversation(conversationId: string, content: string) {
  const user = await requireAuth();
  if (!content.trim()) return { success: false as const, error: 'Mensaje vacío' };

  const membership = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
    select: { id: true, conversation: { select: { members: { select: { userId: true } } } } },
  });
  if (!membership) return { success: false as const, error: 'No autorizado' };

  await prisma.message.create({
    data: { conversationId, senderId: user.id, content },
  });

  // Notificar a los otros miembros
  const otherUserIds = membership.conversation.members
    .filter((m) => m.userId !== user.id)
    .map((m) => m.userId);
  await notifyMany(otherUserIds, {
    type: 'new_message',
    title: `Nuevo mensaje de ${user.name ?? 'alguien'}`,
    body: content.slice(0, 100),
    link: `/dashboard/messages/${conversationId}`,
  });

  revalidatePath(`/dashboard/messages/${conversationId}`);
  revalidatePath('/dashboard/messages');
  return { success: true as const };
}
// Marca una conversación como leída (actualiza lastReadAt).
export async function markRead(conversationId: string) {
  const user = await requireAuth();
  await prisma.conversationMember.update({
    where: { conversationId_userId: { conversationId, userId: user.id } },
    data: { lastReadAt: new Date() },
  });
  revalidatePath(`/dashboard/messages/${conversationId}`);
  revalidatePath('/dashboard/messages');
  return { success: true as const };
}
