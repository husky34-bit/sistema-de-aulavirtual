"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { createCourseSchema } from "../schemas/course.schema";
import { revalidatePath } from "next/cache";

/**
 * Crea un curso nuevo. El curso nace con una "Sección 1" automática
 * para que no se vea roto en la UI (patrón Moodle).
 */
export async function createCourse(formData: FormData) {
  const user = await requireRole(["ADMIN", "MANAGER"]);

  const validated = createCourseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    slug: formData.get("slug"),
    imageUrl: formData.get("imageUrl") || undefined,
    area: formData.get("area") || undefined,
    level: formData.get("level") || undefined,
    modality: formData.get("modality") || undefined,
    published: formData.get("published") === "on",
  });

  if (!validated.success) {
    return {
      success: false as const,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.course.findUnique({
    where: { slug: validated.data.slug },
  });
  if (existing) {
    return {
      success: false as const,
      errors: { slug: ["Este slug ya está en uso"] },
    };
  }

  const instructorId = (formData.get("instructorId") as string) || user.id;

  const course = await prisma.course.create({
    data: {
      ...validated.data,
      instructorId,
      sections: {
        create: [{ title: "Sección 1", position: 0 }],
      },
    },
  });

  revalidatePath("/dashboard/courses");
  return { success: true as const, courseId: course.id };
}
