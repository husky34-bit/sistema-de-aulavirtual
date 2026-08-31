'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const eventSchema = z.object({
  title: z.string().min(1, 'El título del evento es obligatorio').max(200),
  description: z.string().max(5000).optional(),
  location: z.string().max(200).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional().nullable(),
  courseId: z.string().optional().nullable(),
  repeatWeeks: z.number().int().min(1).max(52).optional().default(1),
});

export type CreateCalendarEventInput = z.infer<typeof eventSchema>;

// Obtiene los cursos asociados al usuario para el selector de eventos
export async function getUserCalendarCourses() {
  const user = await requireAuth();

  const [enrollments, taught] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      select: { course: { select: { id: true, title: true } } },
    }),
    prisma.course.findMany({
      where: { instructorId: user.id },
      select: { id: true, title: true },
    }),
  ]);

  const coursesMap = new Map<string, { id: string; title: string }>();
  enrollments.forEach((e) => coursesMap.set(e.course.id, e.course));
  taught.forEach((t) => coursesMap.set(t.id, t));

  return Array.from(coursesMap.values());
}

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

// Crea uno o varios eventos manuales (con soporte de repetición semanal).
export async function createEvent(input: unknown) {
  const user = await requireAuth();
  const validated = eventSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { title, description, location, startsAt, endsAt, courseId, repeatWeeks } = validated.data;
  const startDate = new Date(startsAt);
  const durationMs = endsAt ? new Date(endsAt).getTime() - startDate.getTime() : null;

  // Si hay ubicación o descripción, componer título informativo
  const formattedTitle = location ? `${title} [${location}]` : title;

  const count = Math.min(Math.max(repeatWeeks || 1, 1), 52);
  const createdEvents = [];

  for (let i = 0; i < count; i++) {
    const currentStart = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const currentEnd = durationMs !== null ? new Date(currentStart.getTime() + durationMs) : null;

    const event = await prisma.calendarEvent.create({
      data: {
        title: formattedTitle,
        startsAt: currentStart,
        endsAt: currentEnd,
        userId: user.id,
        courseId: courseId ?? null,
        type: 'manual',
        refId: description ? description.slice(0, 500) : null,
      },
    });
    createdEvents.push(event.id);
  }

  revalidatePath('/dashboard/calendar');
  return { success: true as const, eventIds: createdEvents };
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
