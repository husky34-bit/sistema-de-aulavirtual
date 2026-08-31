"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

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

// Subir foto de perfil de usuario
export async function updateProfileAvatar(formData: FormData) {
  const sessionUser = await requireAuth();

  const file = formData.get("avatar") as File | null;
  if (!file || !(file instanceof File)) {
    return { success: false as const, error: "No se ha seleccionado ninguna imagen" };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false as const,
      error: "Formato no compatible. Usa JPG, PNG, WEBP o GIF.",
    };
  }

  // Max 5 MB
  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false as const,
      error: "La imagen no debe superar los 5 MB.",
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `user-${sessionUser.id}-${Date.now()}.${ext}`;
  const filePath = path.join(uploadDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.promises.writeFile(filePath, buffer);

  const publicUrl = `/uploads/avatars/${fileName}`;

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { image: publicUrl },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return {
    success: true as const,
    imageUrl: publicUrl,
    message: "Foto de perfil actualizada correctamente.",
  };
}

// Eliminar foto de perfil
export async function removeProfileAvatar() {
  try {
    const sessionUser = await requireAuth();

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { image: null },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return {
      success: true as const,
      message: "Foto de perfil eliminada correctamente.",
    };
  } catch {
    return {
      success: false as const,
      error: "Error al eliminar la foto de perfil.",
    };
  }
}
