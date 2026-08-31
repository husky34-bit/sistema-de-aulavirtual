"use server";

import { prisma } from "@/lib/prisma";

/**
 * Devuelve un curso por id con su instructor, secciones y contador
 * de inscritos. Usado en la vista de detalle del curso.
 */
export async function getCourseById(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: { select: { id: true, name: true } },
      sections: { orderBy: { position: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    return { success: false as const, error: "Curso no encontrado" };
  }
  return { success: true as const, data: course };
}
