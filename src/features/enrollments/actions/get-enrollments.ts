"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

/**
 * Devuelve las matrículas del usuario actual con datos del curso.
 * Usado en el dashboard "Mis cursos".
 */
export async function getMyEnrollments() {
  const user = await requireAuth();

  return prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          _count: { select: { enrollments: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });
}
