"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Role } from "@/generated/prisma/client";

const sectionSchema = z.object({
  title: z.string().min(1, "Título requerido").max(120),
});

async function assertCanEditCourse(
  courseId: string,
  userId: string,
  role: Role,
) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Curso no encontrado");
  if (course.instructorId !== userId && role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return course;
}

/**
 * Crea una sección al final del curso (position = max + 1).
 */
export async function createSection(courseId: string, title: string) {
  const user = await requireRole(["ADMIN", "TEACHER", "MANAGER"]);
  await assertCanEditCourse(courseId, user.id, user.role);

  const validated = sectionSchema.safeParse({ title });
  if (!validated.success) {
    return { success: false as const, error: "Título inválido" };
  }

  const max = await prisma.courseSection.aggregate({
    where: { courseId },
    _max: { position: true },
  });

  await prisma.courseSection.create({
    data: {
      title: validated.data.title,
      courseId,
      position: (max._max.position ?? -1) + 1,
    },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true as const };
}

/**
 * Renombra una sección existente.
 */
export async function renameSection(sectionId: string, title: string) {
  const user = await requireRole(["ADMIN", "TEACHER", "MANAGER"]);
  const section = await prisma.courseSection.findUnique({
    where: { id: sectionId },
  });
  if (!section) {
    return { success: false as const, error: "Sección no encontrada" };
  }
  await assertCanEditCourse(section.courseId, user.id, user.role);

  const validated = sectionSchema.safeParse({ title });
  if (!validated.success) {
    return { success: false as const, error: "Título inválido" };
  }

  await prisma.courseSection.update({
    where: { id: sectionId },
    data: { title: validated.data.title },
  });

  revalidatePath(`/dashboard/courses/${section.courseId}`);
  return { success: true as const };
}

/**
 * Elimina una sección.
 */
export async function deleteSection(sectionId: string) {
  const user = await requireRole(["ADMIN", "TEACHER", "MANAGER"]);
  const section = await prisma.courseSection.findUnique({
    where: { id: sectionId },
  });
  if (!section) {
    return { success: false as const, error: "Sección no encontrada" };
  }
  await assertCanEditCourse(section.courseId, user.id, user.role);

  await prisma.courseSection.delete({ where: { id: sectionId } });
  revalidatePath(`/dashboard/courses/${section.courseId}`);
  return { success: true as const };
}

/**
 * Mueve una sección arriba o abajo intercambiando posiciones.
 */
export async function moveSection(sectionId: string, direction: "up" | "down") {
  const user = await requireRole(["ADMIN", "TEACHER", "MANAGER"]);
  const section = await prisma.courseSection.findUnique({
    where: { id: sectionId },
  });
  if (!section) {
    return { success: false as const, error: "Sección no encontrada" };
  }
  await assertCanEditCourse(section.courseId, user.id, user.role);

  const neighbor = await prisma.courseSection.findFirst({
    where: {
      courseId: section.courseId,
      position:
        direction === "up"
          ? { lt: section.position }
          : { gt: section.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) {
    return { success: false as const, error: "No se puede mover más" };
  }

  // Intercambio de posiciones en transacción usando posición temporal para evitar conflicto de unicidad
  await prisma.$transaction([
    prisma.courseSection.update({
      where: { id: section.id },
      data: { position: -1 },
    }),
    prisma.courseSection.update({
      where: { id: neighbor.id },
      data: { position: section.position },
    }),
    prisma.courseSection.update({
      where: { id: section.id },
      data: { position: neighbor.position },
    }),
  ]);

  revalidatePath(`/dashboard/courses/${section.courseId}`);
  return { success: true as const };
}
