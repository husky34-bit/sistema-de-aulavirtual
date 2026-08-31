"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { sanitizeHtml } from "@/features/filters/services/sanitize";

export type ActivityType = "assign" | "quiz" | "page" | "url" | "label" | "forum";

export interface CreateSectionActivityInput {
  courseId: string;
  sectionId: string;
  type: ActivityType;
  title: string;
  description?: string;
  content?: string;
  url?: string;
  maxScore?: number;
  timeLimitMin?: number;
}

export async function addSectionActivity(input: CreateSectionActivityInput) {
  const user = await requireRole(["ADMIN", "TEACHER", "MANAGER"]);

  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
    select: { id: true, instructorId: true },
  });

  if (!course) return { success: false as const, error: "Curso no encontrado" };
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    return { success: false as const, error: "No tienes permiso para editar este curso" };
  }

  const { courseId, sectionId, type, title, description, content, url, maxScore, timeLimitMin } = input;

  if (!title && type !== "label") {
    return { success: false as const, error: "El título es obligatorio" };
  }

  try {
    switch (type) {
      case "assign": {
        const score = maxScore ? Number(maxScore) : 100;
        await prisma.$transaction(async (tx) => {
          const assignment = await tx.assignment.create({
            data: {
              courseId,
              sectionId: sectionId ?? null,
              title: title.trim(),
              description: description?.trim() || null,
              maxScore: score,
              published: true,
            },
          });

          await tx.gradeItem.create({
            data: {
              courseId,
              name: assignment.title,
              maxScore: score,
              weight: 1,
              sourceType: "assignment",
              sourceId: assignment.id,
              position: 0,
            },
          });
        });
        break;
      }

      case "quiz": {
        await prisma.$transaction(async (tx) => {
          const quiz = await tx.quiz.create({
            data: {
              courseId,
              title: title.trim(),
              description: description?.trim() || null,
              timeLimitMin: timeLimitMin ? Number(timeLimitMin) : 30,
              maxAttempts: 1,
              gradeMethod: "highest",
              published: true,
            },
          });

          await tx.gradeItem.create({
            data: {
              courseId,
              name: quiz.title,
              maxScore: 100,
              weight: 1,
              sourceType: "quiz",
              sourceId: quiz.id,
              position: 0,
            },
          });
        });
        break;
      }

      case "page": {
        await prisma.contentPage.create({
          data: {
            courseId,
            sectionId: sectionId ?? null,
            title: title.trim(),
            content: sanitizeHtml(content || description || ""),
            published: true,
          },
        });
        break;
      }

      case "url": {
        if (!url || !url.trim()) {
          return { success: false as const, error: "Debes ingresar una URL válida (ej. https://youtube.com/...)" };
        }
        await prisma.urlResource.create({
          data: {
            courseId,
            sectionId: sectionId ?? null,
            title: title.trim(),
            url: url.trim(),
            published: true,
          },
        });
        break;
      }

      case "forum": {
        await prisma.forum.create({
          data: {
            courseId,
            sectionId: sectionId ?? null,
            title: title.trim(),
            description: description?.trim() || null,
            type: "general",
            published: true,
          },
        });
        break;
      }

      case "label": {
        const text = content || description || title || "";
        if (!text.trim()) {
          return { success: false as const, error: "El contenido del aviso/etiqueta es obligatorio" };
        }
        await prisma.label.create({
          data: {
            courseId,
            sectionId: sectionId ?? null,
            content: sanitizeHtml(text),
          },
        });
        break;
      }

      default:
        return { success: false as const, error: "Tipo de actividad no soportado" };
    }

    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true as const };
  } catch (err: unknown) {
    console.error("Error al crear actividad:", err);
    return { success: false as const, error: "Error al crear la actividad en la base de datos." };
  }
}
