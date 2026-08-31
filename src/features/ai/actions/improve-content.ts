'use server';

import { ai } from '../services/ai-provider';
import { requireRole } from '@/lib/auth-helpers';

export async function improveContent(
  text: string,
  instruction = 'Mejora la redacción haciéndola más clara, pedagógica y estructurada para estudiantes.'
): Promise<{ success: boolean; improved?: string; error?: string }> {
  await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  if (!text.trim()) {
    return { success: false, error: 'El texto no puede estar vacío' };
  }

  try {
    const prompt = `Instrucción: ${instruction}\n\nTexto original:\n${text}\n\nResponde SOLO en formato JSON con la propiedad "improvedText".`;
    const raw = await ai.complete(prompt);
    const parsed = JSON.parse(raw) as { improvedText?: string };

    if (!parsed.improvedText) {
      return { success: false, error: 'No se pudo generar la mejora del texto' };
    }

    return { success: true, improved: parsed.improvedText };
  } catch (error) {
    console.error('Error improving content with AI:', error);
    return { success: false, error: 'Error al comunicarse con el asistente de IA' };
  }
}
