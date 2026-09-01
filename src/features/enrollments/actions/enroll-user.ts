"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { enrollSchema } from "../schemas/enrollment.schema";
import { revalidatePath } from "next/cache";

/**
 * Inscribe manualmente a un usuario en un curso (ADMIN/TEACHER/MANAGER).
 */
export async function enrollUser(input: {
  userId: string;
  courseId: string;
}) {
  await requireRole(["ADMIN", "MANAGER"]);

  const validated = enrollSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, error: "Datos inválidos" };
  }

  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: validated.data.userId,
        courseId: validated.data.courseId,
      },
    },
  });

  if (existing) {
    return {
      success: false as const,
      error: "El usuario ya está inscrito",
    };
  }

  await prisma.enrollment.create({ data: validated.data });
  revalidatePath(`/dashboard/courses/${validated.data.courseId}`);
  return { success: true as const };
}
