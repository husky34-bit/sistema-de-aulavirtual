import { z } from "zod";

// Catálogo de roles (alineado con el enum Role de Prisma)
export const ROLES = [
  "ADMIN",
  "MANAGER",
  "TEACHER",
  "NON_EDITING_TEACHER",
  "STUDENT",
  "GUEST",
  "PARENT",
  "SUPPORT",
  "STAFF",
] as const;

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(ROLES),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
