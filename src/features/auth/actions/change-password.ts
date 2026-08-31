"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Debes ingresar tu contraseña actual."),
    newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string().min(1, "Debes confirmar la nueva contraseña."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export async function changePassword(input: ChangePasswordInput) {
  const sessionUser = await requireAuth();

  const parsed = ChangePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  // Obtener usuario con su contraseña actual
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });

  if (!user || !user.password) {
    return {
      success: false as const,
      error: "Usuario no encontrado o sin contraseña configurada.",
    };
  }

  // Verificar la contraseña actual
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return {
      success: false as const,
      error: "La contraseña actual es incorrecta.",
    };
  }

  // No permitir que la nueva sea idéntica a la anterior
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    return {
      success: false as const,
      error: "La nueva contraseña no puede ser igual a la contraseña actual.",
    };
  }

  // Hashear y guardar la nueva contraseña
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });

  revalidatePath("/dashboard/profile");

  return {
    success: true as const,
    message: "Tu contraseña ha sido actualizada correctamente.",
  };
}
