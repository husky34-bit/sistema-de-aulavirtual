"use server";

import { prisma } from "@/lib/prisma";
import { cache } from "react";

/**
 * Devuelve el catálogo de cursos publicados.
 * Usado en el listado público/de estudiante.
 */
export const getCourses = cache(async () => {
  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      include: {
        instructor: { select: { name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true as const, data: courses };
  } catch {
    return { success: false as const, error: "Error al obtener los cursos" };
  }
});
