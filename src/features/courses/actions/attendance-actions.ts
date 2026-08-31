"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

interface CreateSessionInput {
  courseId: string;
  title: string;
  date: Date;
  durationMin?: number;
}

export async function createAttendanceSession(input: CreateSessionInput) {
  await requireRole(["ADMIN", "TEACHER", "MANAGER"]);

  const session = await prisma.attendanceSession.create({
    data: {
      courseId: input.courseId,
      title: input.title.trim(),
      date: input.date,
      durationMin: input.durationMin ?? 180,
    },
  });

  revalidatePath(`/dashboard/courses/${input.courseId}`);
  return { success: true as const, data: session };
}

interface SaveAttendanceInput {
  sessionId: string;
  records: { userId: string; present: boolean; note?: string }[];
}

export async function saveAttendance(input: SaveAttendanceInput) {
  await requireRole(["ADMIN", "TEACHER", "MANAGER"]);

  // Upsert todos los registros de la sesión
  await Promise.all(
    input.records.map((r) =>
      prisma.attendanceRecord.upsert({
        where: { sessionId_userId: { sessionId: input.sessionId, userId: r.userId } },
        update: { present: r.present, note: r.note ?? null },
        create: {
          sessionId: input.sessionId,
          userId: r.userId,
          present: r.present,
          note: r.note ?? null,
        },
      })
    )
  );

  return { success: true as const };
}

/** Calcular % de asistencia de un estudiante en un curso */
export async function getStudentAttendance(courseId: string, userId: string) {
  const sessions = await prisma.attendanceSession.findMany({
    where: { courseId },
    include: {
      records: { where: { userId } },
    },
    orderBy: { date: "asc" },
  });

  const total = sessions.length;
  const present = sessions.filter((s) => s.records[0]?.present === true).length;
  const percent = total > 0 ? (present / total) * 100 : 0;

  return { total, present, percent, sessions };
}

/** Obtener todas las sesiones de un curso con sus registros (para docente) */
export async function getCourseAttendanceSessions(courseId: string) {
  return prisma.attendanceSession.findMany({
    where: { courseId },
    include: {
      records: { select: { userId: true, present: true } },
    },
    orderBy: { date: "asc" },
  });
}
