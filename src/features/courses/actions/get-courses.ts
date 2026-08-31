"use server";

import { prisma } from "@/lib/prisma";
import { cache } from "react";

export interface CourseWithDetails {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  imageUrl: string | null;
  published: boolean;
  area: string | null;
  level: string | null;
  modality: string | null;
  liveSchedule: string | null;
  createdAt: Date;
  instructor: { id: string; name: string | null; email: string | null };
  _count: {
    enrollments: number;
    sections: number;
    quizzes: number;
    assignments: number;
  };
  isEnrolled: boolean;
}

/**
 * Devuelve el catálogo de cursos publicados, enriquecido con el estado de matrícula del usuario.
 */
export const getCourses = cache(async (userId?: string) => {
  try {
    const [courses, userEnrollments] = await Promise.all([
      prisma.course.findMany({
        where: { published: true },
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          _count: {
            select: {
              enrollments: true,
              sections: true,
              quizzes: true,
              assignments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      userId
        ? prisma.enrollment.findMany({
            where: { userId },
            select: { courseId: true },
          })
        : Promise.resolve([]),
    ]);

    const enrolledCourseIds = new Set(userEnrollments.map((e) => e.courseId));

    const enrichedCourses: CourseWithDetails[] = courses.map((course) => ({
      ...course,
      isEnrolled: enrolledCourseIds.has(course.id) || (userId ? course.instructor.id === userId : false),
    }));

    return { success: true as const, data: enrichedCourses };
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return { success: false as const, error: "Error al obtener los cursos" };
  }
});

