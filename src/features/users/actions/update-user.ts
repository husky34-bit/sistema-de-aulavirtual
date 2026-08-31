"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { updateUserRoleSchema } from "../schemas/user.schema";
import { revalidatePath } from "next/cache";

/**
 * Cambia el rol de un usuario. Protección anti-autobloqueo:
 * un ADMIN no puede quitarse su propio rol de administrador.
 */
export async function updateUserRole(input: {
  userId: string;
  role: string;
}) {
  const user = await requireRole(["ADMIN"]);

  const validated = updateUserRoleSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, error: "Datos inválidos" };
  }

  // Anti-autobloqueo: no puedes dejarte sin ADMIN a ti mismo
  if (
    validated.data.userId === user.id &&
    validated.data.role !== "ADMIN"
  ) {
    return {
      success: false as const,
      error: "No puedes quitarte el rol de administrador",
    };
  }

  await prisma.user.update({
    where: { id: validated.data.userId },
    data: { role: validated.data.role },
  });

  revalidatePath("/users");
  return { success: true as const };
}
