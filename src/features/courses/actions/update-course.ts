"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { updateCourseSchema } from "../schemas/course.schema";
import { revalidatePath } from "next/cache";

/**
 * Actualiza un curso existente. Solo el instructor dueño o un ADMIN
 * pueden editarlo.
 */
export async function updateCourse(courseId: string, formData: FormData) {
  const user = await requireRole(["ADMIN", "TEACHER", "MANAGER"]);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    return { success: false as const, error: "Curso no encontrado" };
  }

  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    return { success: false as const, error: "No autorizado" };
  }

  const validated = updateCourseSchema.safeParse({
    title: formData.get("title") ?? undefined,
    description: formData.get("description") ?? undefined,
    published: formData.get("published") === "on",
  });

  if (!validated.success) {
    return {
      success: false as const,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  await prisma.course.update({
    where: { id: courseId },
    data: validated.data,
  });

  revalidatePath("/dashboard/courses");
  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true as const };
}
