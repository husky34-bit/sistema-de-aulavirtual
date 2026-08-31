'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const eventSchema = z.object({
  title: z.string().min(1).max(120),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  courseId: z.string().optional().nullable(),
});

// Obtiene los eventos del calendario del usuario (propios + de sus cursos).
export async function getEvents() {
  const user = await requireAuth();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    select: { courseId: true },
  });
  const courseIds = enrollments.map((e) => e.courseId);
  // Añadir cursos donde es instructor
  const taught = await prisma.course.findMany({
    where: { instructorId: user.id },
    select: { id: true },
  });
  courseIds.push(...taught.map((t) => t.id));

  const events = await prisma.calendarEvent.findMany({
    where: {
      OR: [
        { userId: user.id },
        { courseId: { in: courseIds } },
      ],
    },
    orderBy: { startsAt: 'asc' },
  });

  return { success: true as const, data: events };
}

// Crea un evento manual.
export async function createEvent(input: unknown) {
  const user = await requireAuth();
  const validated = eventSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { title, startsAt, endsAt, courseId } = validated.data;
  const event = await prisma.calendarEvent.create({
    data: {
      title,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      userId: user.id,
      courseId: courseId ?? null,
      type: 'manual',
    },
  });

  revalidatePath('/dashboard/calendar');
  return { success: true as const, eventId: event.id };
}

// Elimina un evento manual.
export async function deleteEvent(eventId: string) {
  const user = await requireAuth();
  const event = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    select: { userId: true, type: true },
  });
  if (!event) return { success: false as const, error: 'Evento no encontrado' };
  if (event.type !== 'manual') return { success: false as const, error: 'No se pueden eliminar eventos automáticos' };
  if (event.userId !== user.id) return { success: false as const, error: 'No autorizado' };

  await prisma.calendarEvent.delete({ where: { id: eventId } });
  revalidatePath('/dashboard/calendar');
  return { success: true as const };
}
