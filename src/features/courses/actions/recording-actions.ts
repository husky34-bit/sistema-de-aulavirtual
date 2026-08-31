"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

interface AddRecordingInput {
  courseId: string;
  title: string;
  videoUrl: string;
  provider: string;
  sessionDate?: string;
}

export async function addRecording(input: AddRecordingInput) {
  await requireRole(["ADMIN", "TEACHER", "MANAGER"]);

  if (!input.title.trim() || !input.videoUrl.trim()) {
    return { success: false as const, error: "Título y URL son requeridos" };
  }

  const recording = await prisma.classRecording.create({
    data: {
      courseId: input.courseId,
      title: input.title.trim(),
      videoUrl: input.videoUrl.trim(),
      provider: input.provider,
      sessionDate: input.sessionDate ? new Date(input.sessionDate) : null,
      published: true,
    },
  });

  revalidatePath(`/dashboard/courses/${input.courseId}`);
  return { success: true as const, data: recording };
}

export async function deleteRecording(recordingId: string) {
  const user = await requireRole(["ADMIN", "TEACHER", "MANAGER"]);

  const recording = await prisma.classRecording.findUnique({
    where: { id: recordingId },
    include: { course: { select: { instructorId: true } } },
  });
  if (!recording) return { success: false as const, error: "Grabación no encontrada" };

  if (recording.course.instructorId !== user.id && user.role !== "ADMIN") {
    return { success: false as const, error: "No autorizado" };
  }

  await prisma.classRecording.delete({ where: { id: recordingId } });
  revalidatePath(`/dashboard/courses/${recording.courseId}`);
  return { success: true as const };
}

export async function getRecordings(courseId: string) {
  const recordings = await prisma.classRecording.findMany({
    where: { courseId, published: true },
    orderBy: { sessionDate: "desc" },
  });
  return recordings;
}
