'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import { forumSchema, discussionSchema, postSchema, editPostSchema } from '../schemas/forum.schema';
import { sanitizeHtml } from '@/features/filters/services/sanitize';
import { notify } from '@/features/notifications/services/notification-dispatcher';
import { revalidatePath } from 'next/cache';

// Verifica acceso al curso: instructor/admin o matriculado
async function assertCourseAccess(courseId: string, userId: string, role: string, requireStaff = false) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course) throw new Error('Curso no encontrado');
  const isStaff = course.instructorId === userId || role === 'ADMIN';
  if (requireStaff) {
    if (!isStaff && role !== 'MANAGER') throw new Error('No autorizado');
    return course;
  }
  if (isStaff) return course;
  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
  if (!enrolled) throw new Error('No autorizado');
  return course;
}

// === FOROS ===

// Lista los foros de un curso.
export async function getForums(courseId: string) {
  await requireAuth();
  return prisma.forum.findMany({
    where: { courseId },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { discussions: true } },
      section: { select: { id: true, title: true } },
    },
  });
}

// Crea un foro.
export async function createForum(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const validated = forumSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { courseId, sectionId, title, description, type, published } = validated.data;
  try {
    await assertCourseAccess(courseId, user.id, user.role, true);
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }

  const forum = await prisma.forum.create({
    data: { courseId, sectionId: sectionId ?? null, title, description: description ?? null, type, published },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true as const, forumId: forum.id };
}

// === DISCUSIONES ===

// Lista las discusiones de un foro con contador de respuestas.
export async function getDiscussions(forumId: string) {
  const user = await requireAuth();
  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
    include: { course: { select: { id: true, instructorId: true } } },
  });
  if (!forum) return { success: false as const, error: 'Foro no encontrado' };
  try {
    await assertCourseAccess(forum.courseId, user.id, user.role);
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }

  const discussions = await prisma.discussion.findMany({
    where: { forumId },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { posts: true } },
    },
  });

  return { success: true as const, data: discussions };
}

// Crea una nueva discusión con su primer post.
export async function createDiscussion(input: unknown) {
  const user = await requireAuth();
  const validated = discussionSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { forumId, title, content } = validated.data;
  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
    include: { course: { select: { id: true, instructorId: true } } },
  });
  if (!forum) return { success: false as const, error: 'Foro no encontrado' };
  try {
    await assertCourseAccess(forum.courseId, user.id, user.role);
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }

  const discussion = await prisma.$transaction(async (tx) => {
    const d = await tx.discussion.create({
      data: { forumId, authorId: user.id, title },
    });
    await tx.forumPost.create({
      data: { discussionId: d.id, authorId: user.id, content: sanitizeHtml(content) },
    });
    return d;
  });

  revalidatePath(`/dashboard/courses/${forum.courseId}/forum/${forumId}`);
  return { success: true as const, discussionId: discussion.id };
}

// === POSTS ===

// Obtiene todos los posts de una discusión (con hilos anidados).
// En foros Q&A, el estudiante solo ve respuestas de otros DESPUÉS de publicar la suya.
export async function getPosts(discussionId: string) {
  const user = await requireAuth();
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: { forum: { include: { course: { select: { id: true, instructorId: true } } } } },
  });
  if (!discussion) return { success: false as const, error: 'Discusión no encontrada' };
  try {
    await assertCourseAccess(discussion.forum.course.id, user.id, user.role);
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }

  const isStaff = discussion.forum.course.instructorId === user.id || user.role === 'ADMIN';

  const posts = await prisma.forumPost.findMany({
    where: { discussionId },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });

  // En foros Q&A, ocultar respuestas de otros hasta que el estudiante publique la suya
  if (discussion.forum.type === 'qanda' && !isStaff) {
    const hasOwnPost = posts.some((p) => p.authorId === user.id);
    if (!hasOwnPost) {
      // Solo mostrar el post inicial (del autor de la discusión)
      const firstPost = posts[0];
      return { success: true as const, data: firstPost ? [firstPost] : [], isQnaHidden: true };
    }
  }

  return { success: true as const, data: posts, isQnaHidden: false };
}

// Responde a un post (o crea uno nuevo si parentId es null).
export async function replyPost(input: unknown) {
  const user = await requireAuth();
  const validated = postSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { discussionId, parentId, content } = validated.data;
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: { forum: { include: { course: { select: { id: true, instructorId: true } } } } },
  });
  if (!discussion) return { success: false as const, error: 'Discusión no encontrada' };
  if (discussion.locked) return { success: false as const, error: 'Discusión cerrada' };
  try {
    await assertCourseAccess(discussion.forum.course.id, user.id, user.role);
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }

  const post = await prisma.forumPost.create({
    data: {
      discussionId,
      parentId: parentId ?? null,
      authorId: user.id,
      content: sanitizeHtml(content),
    },
  });

  // Notificar al autor del post padre
  if (parentId) {
    const parent = await prisma.forumPost.findUnique({
      where: { id: parentId },
      select: { authorId: true },
    });
    if (parent && parent.authorId !== user.id) {
      await notify({
        userId: parent.authorId,
        type: 'forum_reply',
        title: 'Nueva respuesta en el foro',
        body: `${user.name ?? 'Alguien'} respondió a tu mensaje`,
        link: `/dashboard/courses/${discussion.forum.course.id}/forum/${discussion.forum.id}/discussion/${discussionId}`,
      });
    }
  }

  revalidatePath(`/dashboard/courses/${discussion.forum.course.id}/forum/${discussion.forum.id}/discussion/${discussionId}`);
  return { success: true as const, postId: post.id };
}

// Edita un post propio dentro de la ventana de 30 minutos.
export async function editPost(input: unknown) {
  const user = await requireAuth();
  const validated = editPostSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { postId, content } = validated.data;
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, createdAt: true },
  });
  if (!post) return { success: false as const, error: 'Mensaje no encontrado' };
  if (post.authorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  // Ventana de 30 minutos para editar
  const elapsed = Date.now() - post.createdAt.getTime();
  const isStaff = user.role === 'ADMIN' || user.role === 'TEACHER' || user.role === 'MANAGER';
  if (!isStaff && elapsed > 30 * 60 * 1000) {
    return { success: false as const, error: 'El tiempo de edición (30 min) ha expirado' };
  }

  await prisma.forumPost.update({
    where: { id: postId },
    data: { content: sanitizeHtml(content), editedAt: new Date() },
  });

  return { success: true as const };
}

// Elimina un post (propio o cualquier uno si es TEACHER+).
export async function deletePost(postId: string) {
  const user = await requireAuth();
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, discussion: { include: { forum: { include: { course: { select: { id: true } } } } } } },
  });
  if (!post) return { success: false as const, error: 'Mensaje no encontrado' };

  const isStaff = user.role === 'ADMIN' || user.role === 'TEACHER' || user.role === 'MANAGER';
  if (post.authorId !== user.id && !isStaff) {
    return { success: false as const, error: 'No autorizado' };
  }

  await prisma.forumPost.delete({ where: { id: postId } });

  revalidatePath(`/dashboard/courses/${post.discussion.forum.course.id}/forum/${post.discussion.forum.id}/discussion/${post.discussion.id}`);
  return { success: true as const };
}

// Fija una discusión (TEACHER+).
export async function pinDiscussion(discussionId: string, pinned: boolean) {
  await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: { forum: { include: { course: { select: { id: true } } } } },
  });
  if (!discussion) return { success: false as const, error: 'Discusión no encontrada' };

  await prisma.discussion.update({
    where: { id: discussionId },
    data: { pinned },
  });

  revalidatePath(`/dashboard/courses/${discussion.forum.course.id}/forum/${discussion.forum.id}`);
  return { success: true as const };
}

// Cierra una discusión (TEACHER+).
export async function lockDiscussion(discussionId: string, locked: boolean) {
  await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: { forum: { include: { course: { select: { id: true } } } } },
  });
  if (!discussion) return { success: false as const, error: 'Discusión no encontrada' };

  await prisma.discussion.update({
    where: { id: discussionId },
    data: { locked },
  });

  revalidatePath(`/dashboard/courses/${discussion.forum.course.id}/forum/${discussion.forum.id}`);
  return { success: true as const };
}
