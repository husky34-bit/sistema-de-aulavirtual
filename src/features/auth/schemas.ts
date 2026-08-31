import * as z from "zod";

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
    .trim(),
  email: z.email({ error: "Introduce un correo válido." }).trim(),
  password: z
    .string()
    .min(8, { error: "La contraseña debe tener al menos 8 caracteres." })
    .regex(/[a-zA-Z]/, { error: "Debe contener al menos una letra." })
    .regex(/[0-9]/, { error: "Debe contener al menos un número." })
    .regex(/[^a-zA-Z0-9]/, {
      error: "Debe contener al menos un carácter especial.",
    })
    .trim(),
});

export const LoginSchema = z.object({
  email: z.email({ error: "Introduce un correo válido." }).trim(),
  password: z.string().min(1, { error: "Introduce tu contraseña." }),
});

export type AuthState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
