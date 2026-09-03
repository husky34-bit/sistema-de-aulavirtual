"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export interface BulkImportRowResult {
  row: number;
  name: string;
  email: string;
  status: "created" | "already_exists" | "error";
  message: string;
}

export interface BulkImportResult {
  success: boolean;
  totalProcessed: number;
  totalCreated: number;
  totalEnrolled: number;
  errorsCount: number;
  details: BulkImportRowResult[];
}

/**
 * Importa múltiples estudiantes a partir de texto CSV (formato: nombre,email[,password]).
 * Si se especifica courseId, también matricula a los estudiantes en dicho curso.
 */
export async function bulkImportStudents(
  csvText: string,
  courseId?: string
): Promise<BulkImportResult> {
  await requireRole(["ADMIN", "MANAGER"]);

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const details: BulkImportRowResult[] = [];
  let totalCreated = 0;
  let totalEnrolled = 0;
  let errorsCount = 0;

  // Saltamos encabezado si la primera línea contiene "email" o "nombre"
  let startIndex = 0;
  if (
    lines.length > 0 &&
    (lines[0].toLowerCase().includes("email") ||
      lines[0].toLowerCase().includes("nombre"))
  ) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i];
    // Soportar coma o punto y coma como separador
    const cols = rawLine.includes(";") ? rawLine.split(";") : rawLine.split(",");

    const name = (cols[0] ?? "").trim();
    const email = (cols[1] ?? "").trim().toLowerCase();
    const passwordRaw = (cols[2] ?? "").trim() || "Password1!";

    if (!name || !email || !email.includes("@")) {
      errorsCount++;
      details.push({
        row: i + 1,
        name: name || "(Vacío)",
        email: email || "(Inválido)",
        status: "error",
        message: "Nombre o correo inválido.",
      });
      continue;
    }

    try {
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        const passwordHash = await bcrypt.hash(passwordRaw, 10);
        user = await prisma.user.create({
          data: {
            name,
            email,
            password: passwordHash,
            role: "STUDENT",
          },
        });
        totalCreated++;
      }

      if (courseId) {
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId,
            },
          },
        });

        if (!existingEnrollment) {
          await prisma.enrollment.create({
            data: {
              userId: user.id,
              courseId,
            },
          });
          totalEnrolled++;
        }
      }

      details.push({
        row: i + 1,
        name,
        email,
        status: user ? "created" : "already_exists",
        message: "Procesado correctamente.",
      });
    } catch {
      errorsCount++;
      details.push({
        row: i + 1,
        name,
        email,
        status: "error",
        message: "Error al procesar registro en base de datos.",
      });
    }
  }

  revalidatePath("/users");
  revalidatePath("/admin");
  if (courseId) {
    revalidatePath(`/dashboard/courses/${courseId}`);
  }

  return {
    success: errorsCount === 0,
    totalProcessed: lines.length - startIndex,
    totalCreated,
    totalEnrolled,
    errorsCount,
    details,
  };
}
