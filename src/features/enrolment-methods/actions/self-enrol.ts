"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const keySchema = z
  .string()
  .min(4, "La clave debe tener mínimo 4 caracteres")
  .max(50);

/**
 * El instructor define o quita la clave de auto-matriculación de un curso.
 */
export async function setCourseEnrolKey(courseId: string, key: string | null) {
  const user = await requireRole(["ADMIN", "TEACHER", "MANAGER"]);

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return { success: false as const, error: "Curso no encontrado" };
  }
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    return { success: false as const, error: "No autorizado" };
  }

  if (key !== null) {
    const validated = keySchema.safeParse(key);
    if (!validated.success) {
      return {
        success: false as const,
        error: validated.error.issues[0].message,
      };
    }
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { enrolKey: key },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true as const };
}

/**
 * El estudiante se auto-inscribe en un curso con la clave (si el curso la requiere).
 */
export async function selfEnrol(courseId: string, key: string) {
  const user = await requireAuth();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) {
    return { success: false as const, error: "Curso no disponible" };
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });
  if (existing) {
    return {
      success: false as const,
      error: "Ya estás inscrito en este curso",
    };
  }

  // Si el curso tiene clave, validarla
  if (course.enrolKey && course.enrolKey !== key) {
    return { success: false as const, error: "Clave incorrecta" };
  }

  await prisma.enrollment.create({
    data: { userId: user.id, courseId },
  });

  revalidatePath("/dashboard");
  return { success: true as const };
}
