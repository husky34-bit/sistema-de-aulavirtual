'use server';

import { ai } from '../services/ai-provider';
import { requireRole } from '@/lib/auth-helpers';
import { createQuestion } from '@/features/questions/actions/create-question';
import { createQuestionSchema } from '@/features/questions/schemas/question.schema';

interface GeneratedQuestionOption {
  text: string;
  fraction: number;
}

interface GeneratedQuestionItem {
  name: string;
  text: string;
  options: GeneratedQuestionOption[];
}

export async function generateQuestions(
  categoryId: string,
  topic: string,
  count = 2
): Promise<{ success: boolean; created: number; failed: number; error?: string }> {
  await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  if (!topic.trim()) {
    return { success: false, created: 0, failed: 0, error: 'El tema no puede estar vacío' };
  }

  try {
    const prompt = `Genera ${count} preguntas de opción múltiple sobre "${topic}" en español.
Responde SOLO con JSON: { "questions": [{ "name": "...", "text": "...", "options": [{ "text": "...", "fraction": 1|0 }] }] }.
Exactamente una opción con fraction 1 por pregunta.`;

    const raw = await ai.complete(prompt);
    const parsed = JSON.parse(raw) as { questions?: GeneratedQuestionItem[] };

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return { success: false, created: 0, failed: 0, error: 'Formato de respuesta IA inválido' };
    }

    const createdIds: string[] = [];
    const failedIndices: number[] = [];

    for (const [i, q] of parsed.questions.entries()) {
      const candidate = {
        name: q.name.startsWith('[IA]') ? q.name : `[IA] ${q.name}`,
        text: q.text,
        defaultScore: 1,
        categoryId,
        data: {
          type: 'multichoice' as const,
          single: true,
          shuffle: true,
          options: q.options,
        },
      };

      // Validación estricta con schema Zod antes de ingresar a la base de datos
      const parseResult = createQuestionSchema.safeParse(candidate);
      if (!parseResult.success) {
        failedIndices.push(i + 1);
        continue;
      }

      const result = await createQuestion(candidate);
      if (result.success && result.questionId) {
        createdIds.push(result.questionId);
      } else {
        failedIndices.push(i + 1);
      }
    }

    return {
      success: true,
      created: createdIds.length,
      failed: failedIndices.length,
    };
  } catch (error) {
    console.error('Error generating questions with AI:', error);
    return { success: false, created: 0, failed: 0, error: 'Error al comunicarse con el asistente de IA' };
  }
}
