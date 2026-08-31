"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const CreateStudentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  courseId: z.string().optional(),
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;

export async function createStudent(input: CreateStudentInput) {
  // Solo docentes, administradores y gestores pueden registrar alumnos directamente
  await requireRole(["TEACHER", "ADMIN", "MANAGER"]);

  const parsed = CreateStudentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { name, email, password, courseId } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    if (courseId) {
      // Si ya existe, verificar si ya está matriculado en este curso
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: existingUser.id,
            courseId,
          },
        },
      });

      if (existingEnrollment) {
        return {
          success: false as const,
          error: "El estudiante ya existe en la plataforma y ya está matriculado en este curso.",
        };
      }

      // Matricular al estudiante existente
      await prisma.enrollment.create({
        data: {
          userId: existingUser.id,
          courseId,
        },
      });

      revalidatePath(`/dashboard/courses/${courseId}`);
      revalidatePath("/users");

      return {
        success: true as const,
        message: `El usuario ya existía en la plataforma. Ha sido matriculado exitosamente en el curso con el rol ${existingUser.role}.`,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
        },
      };
    }

    return {
      success: false as const,
      error: "Ya existe un usuario registrado con este correo electrónico.",
    };
  }

  // Encriptar la contraseña inicial
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el nuevo usuario con rol STUDENT
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "STUDENT",
      ...(courseId
        ? {
            enrollments: {
              create: {
                courseId,
              },
            },
          }
        : {}),
    },
  });

  if (courseId) {
    revalidatePath(`/dashboard/courses/${courseId}`);
  }
  revalidatePath("/users");
  revalidatePath("/dashboard/courses");

  return {
    success: true as const,
    message: "Estudiante registrado y matriculado exitosamente.",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  };
}
