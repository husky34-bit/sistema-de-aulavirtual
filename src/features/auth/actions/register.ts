"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema, type AuthState } from "@/features/auth/schemas";
import { signIn } from "@/auth";

export async function register(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as {
        name?: string[];
        email?: string[];
        password?: string[];
      },
    };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "Ya existe una cuenta con ese correo." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashedPassword, role: "STUDENT" },
  });

  // Inicia sesión automáticamente tras el registro
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    // Si falla el auto-login, lo enviamos a /login
    return redirect("/login");
  }

  redirect("/dashboard");
}
