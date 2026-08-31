"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

/**
 * Lista usuarios para el panel de administración (solo ADMIN).
 * Soporta búsqueda por nombre o email.
 */
export async function getUsers(search?: string) {
  await requireRole(["ADMIN"]);

  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
