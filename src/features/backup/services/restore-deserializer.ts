// Deserializador de respaldo. Restaura un curso desde JSON usando
// un mapa de IDs antigos→nuevos (id-remapper) para preservar dependencias.

import { prisma } from '@/lib/prisma';
import type { CourseBackup } from './backup-serializer';

/**
 * Restaura un curso desde un backup JSON.
 * Crea un nuevo curso con contenido nuevo (no duplica IDs).
 */
export async function restoreCourse(backup: CourseBackup, instructorId: string): Promise<string> {
  // Crear el curso
  const slug = `${backup.course.slug}-restaurado-${Date.now()}`;
  const course = await prisma.course.create({
    data: {
      title: backup.course.title,
      description: backup.course.description,
      slug,
      published: false,
      instructorId,
    },
  });

  // Restaurar secciones
  for (const section of backup.sections) {
    await prisma.courseSection.create({
      data: {
        title: section.title,
        position: section.position,
        courseId: course.id,
      },
    });
  }

  // Restaurar categorías de preguntas y preguntas
  const questionIdMap = new Map<number, string>();
  for (let catIdx = 0; catIdx < backup.questionCategories.length; catIdx++) {
    const catData = backup.questionCategories[catIdx];
    const category = await prisma.questionCategory.create({
      data: { name: catData.name, description: catData.description, courseId: course.id },
    });

    const catQuestions = backup.questions.filter((q) => q.categoryIndex === catIdx);
    for (let qIdx = 0; qIdx < catQuestions.length; qIdx++) {
      const qData = catQuestions[qIdx];
      const questionId = catIdx * 1000 + qIdx;
      const question = await prisma.question.create({
        data: { categoryId: category.id, name: qData.name },
      });
      questionIdMap.set(questionId, question.id);

      for (const v of qData.versions) {
        await prisma.questionVersion.create({
          data: {
            questionId: question.id,
            version: v.version,
            type: v.type,
            text: v.text,
            data: v.data as object,
            defaultScore: v.defaultScore,
          },
        });
      }
    }
  }

  // Restaurar quizzes
  for (const quizData of backup.quizzes) {
    const quiz = await prisma.quiz.create({
      data: {
        courseId: course.id,
        title: quizData.title,
        description: quizData.description,
        timeLimitMin: quizData.timeLimitMin,
        maxAttempts: quizData.maxAttempts,
        gradeMethod: quizData.gradeMethod as 'highest' | 'average' | 'first' | 'last',
        openAt: quizData.openAt ? new Date(quizData.openAt) : null,
        closeAt: quizData.closeAt ? new Date(quizData.closeAt) : null,
        published: false,
      },
    });

    for (const qq of quizData.questions) {
      const questionId = questionIdMap.get(qq.questionIndex);
      if (!questionId) continue;
      await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionId,
          position: qq.position,
          score: qq.score,
        },
      });
    }
  }

  // Restaurar tareas
  for (const aData of backup.assignments) {
    await prisma.assignment.create({
      data: {
        courseId: course.id,
        title: aData.title,
        description: aData.description,
        instructions: aData.instructions,
        maxScore: aData.maxScore,
        openAt: aData.openAt ? new Date(aData.openAt) : null,
        dueAt: aData.dueAt ? new Date(aData.dueAt) : null,
        cutoffAt: aData.cutoffAt ? new Date(aData.cutoffAt) : null,
        allowOnlineText: aData.allowOnlineText,
        allowFiles: aData.allowFiles,
        maxFiles: aData.maxFiles,
        maxFileSizeMb: aData.maxFileSizeMb,
        published: false,
      },
    });
  }

  return course.id;
}
