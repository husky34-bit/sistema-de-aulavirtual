"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { LoginSchema, type AuthState } from "@/features/auth/schemas";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function login(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as {
        email?: string[];
        password?: string[];
      },
    };
  }
  const { email, password } = parsed.data;

  // Protección anti fuerza-bruta: Rate limit de 5 intentos por minuto por email
  const limit = checkRateLimit(`login_${email.toLowerCase()}`, { maxRequests: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    const seconds = Math.ceil(limit.resetInMs / 1000);
    return {
      message: `Demasiados intentos fallidos. Por favor espera ${seconds} segundos antes de volver a intentar.`,
    };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    return { message: "Correo o contraseña incorrectos." };
  }

  // Sanitiza el callbackUrl: solo acepta rutas internas (empiezan con "/")
  // para evitar ataques de open redirect. Si falta o es inválido, usa /dashboard.
  const rawCallback = formData.get("callbackUrl");
  const callbackUrl =
    typeof rawCallback === "string" && rawCallback.startsWith("/")
      ? rawCallback
      : "/dashboard";

  redirect(callbackUrl);
}
