'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { sanitizeHtml } from '@/features/filters/services/sanitize';
import { z } from 'zod';

const addCommentSchema = z.object({
  contextType: z.string().min(1),
  contextId: z.string().min(1),
  content: z.string().min(1).max(5000),
});

// Obtiene los comentarios de un contexto.
export async function getComments(contextType: string, contextId: string) {
  await requireAuth();
  const comments = await prisma.comment.findMany({
    where: { contextType, contextId },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return { success: true as const, data: comments };
}

// Añade un comentario.
export async function addComment(input: unknown) {
  const user = await requireAuth();
  const validated = addCommentSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { contextType, contextId, content } = validated.data;
  const comment = await prisma.comment.create({
    data: {
      contextType,
      contextId,
      authorId: user.id,
      content: sanitizeHtml(content),
    },
  });

  return { success: true as const, commentId: comment.id };
}

// Elimina un comentario (propio o cualquier uno si es TEACHER+).
export async function deleteComment(commentId: string) {
  const user = await requireAuth();
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });
  if (!comment) return { success: false as const, error: 'Comentario no encontrado' };

  const isStaff = user.role === 'ADMIN' || user.role === 'TEACHER' || user.role === 'MANAGER';
  if (comment.authorId !== user.id && !isStaff) {
    return { success: false as const, error: 'No autorizado' };
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return { success: true as const };
}
