import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const ROLE_HIERARCHY: Record<Role, number> = {
  GUEST: 0,
  PARENT: 1,
  STUDENT: 2,
  NON_EDITING_TEACHER: 3,
  TEACHER: 4,
  STAFF: 5,
  SUPPORT: 6,
  MANAGER: 7,
  ADMIN: 8,
};

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
});

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  if (!user) return user;
  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard?forbidden=1");
  }
  return user;
}

export function hasRole(userRole: Role, required: Role) {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required];
}

export async function getEnrollments() {
  const user = await requireAuth();
  return prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: true },
  });
}
