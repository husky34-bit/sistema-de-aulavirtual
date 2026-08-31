"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "Nombre demasiado largo"),
});

export async function updateProfileName(input: { name: string }) {
  const sessionUser = await requireAuth();

  const parsed = UpdateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Nombre inválido",
    };
  }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { name: parsed.data.name.trim() },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return {
    success: true as const,
    message: "Tu nombre ha sido actualizado correctamente.",
  };
}
