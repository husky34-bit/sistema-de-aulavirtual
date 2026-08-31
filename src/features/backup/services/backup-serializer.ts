// Serializador de respaldo de curso. Exporta el contenido completo
// de un curso a JSON portable (sin usuarios ni matrículas).

import { prisma } from '@/lib/prisma';

export interface CourseBackup {
  version: string;
  exportedAt: string;
  course: {
    title: string;
    description: string | null;
    slug: string;
  };
  sections: { title: string; position: number }[];
  questionCategories: { name: string; description: string | null }[];
  questions: { categoryIndex: number; name: string; versions: { version: number; type: string; text: string; data: unknown; defaultScore: number }[] }[];
  quizzes: {
    title: string;
    description: string | null;
    timeLimitMin: number | null;
    maxAttempts: number;
    gradeMethod: string;
    openAt: string | null;
    closeAt: string | null;
    questions: { questionIndex: number; position: number; score: number }[];
  }[];
  assignments: {
    title: string;
    description: string | null;
    instructions: string | null;
    maxScore: number;
    openAt: string | null;
    dueAt: string | null;
    cutoffAt: string | null;
    allowOnlineText: boolean;
    allowFiles: boolean;
    maxFiles: number;
    maxFileSizeMb: number;
  }[];
}

/**
 * Serializa un curso completo a JSON portable.
 */
export async function serializeCourse(courseId: string): Promise<CourseBackup> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sections: { orderBy: { position: 'asc' } },
      questionCategories: { include: { questions: { include: { versions: { orderBy: { version: 'asc' } } } } } },
      quizzes: { include: { questions: { orderBy: { position: 'asc' }, include: { question: { select: { name: true } } } } } },
      assignments: true,
    },
  });

  if (!course) throw new Error('Curso no encontrado');

  const sections = course.sections.map((s) => ({ title: s.title, position: s.position }));
  const questionCategories = course.questionCategories.map((c) => ({ name: c.name, description: c.description }));
  const questions = course.questionCategories.flatMap((cat, catIdx) =>
    cat.questions.map((q) => ({
      categoryIndex: catIdx,
      name: q.name,
      versions: q.versions.map((v) => ({
        version: v.version,
        type: v.type,
        text: v.text,
        data: v.data,
        defaultScore: v.defaultScore,
      })),
    })),
  );

  const quizzes = course.quizzes.map((quiz) => ({
    title: quiz.title,
    description: quiz.description,
    timeLimitMin: quiz.timeLimitMin,
    maxAttempts: quiz.maxAttempts,
    gradeMethod: quiz.gradeMethod,
    openAt: quiz.openAt?.toISOString() ?? null,
    closeAt: quiz.closeAt?.toISOString() ?? null,
    questions: quiz.questions.map((qq) => ({
      questionIndex: questions.findIndex((q) => q.name === qq.question?.name),
      position: qq.position,
      score: qq.score,
    })),
  }));

  const assignments = course.assignments.map((a) => ({
    title: a.title,
    description: a.description,
    instructions: a.instructions,
    maxScore: a.maxScore,
    openAt: a.openAt?.toISOString() ?? null,
    dueAt: a.dueAt?.toISOString() ?? null,
    cutoffAt: a.cutoffAt?.toISOString() ?? null,
    allowOnlineText: a.allowOnlineText,
    allowFiles: a.allowFiles,
    maxFiles: a.maxFiles,
    maxFileSizeMb: a.maxFileSizeMb,
  }));

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    course: { title: course.title, description: course.description, slug: course.slug },
    sections,
    questionCategories,
    questions,
    quizzes,
    assignments,
  };
}
