"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { enrollSchema } from "../schemas/enrollment.schema";
import { revalidatePath } from "next/cache";

/**
 * Desinscribe a un usuario de un curso (ADMIN/TEACHER/MANAGER).
 */
export async function unenrollUser(input: {
  userId: string;
  courseId: string;
}) {
  await requireRole(["ADMIN", "TEACHER", "MANAGER"]);

  const validated = enrollSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, error: "Datos inválidos" };
  }

  await prisma.enrollment.delete({
    where: {
      userId_courseId: {
        userId: validated.data.userId,
        courseId: validated.data.courseId,
      },
    },
  });

  revalidatePath(`/dashboard/courses/${validated.data.courseId}`);
  return { success: true as const };
}
