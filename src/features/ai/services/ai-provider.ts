// Proveedor de Inteligencia Artificial desacoplado (inspirado en el subsistema ai/ de Moodle).

export interface AiProvider {
  complete(prompt: string): Promise<string>;
}

export class OpenAiProvider implements AiProvider {
  async complete(prompt: string): Promise<string> {
    const apiKey = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback a proveedor educativo inteligente local
      return new SimulatedAiProvider().complete(prompt);
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL ?? 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) {
        throw new Error(`OpenAI API error: ${res.statusText}`);
      }

      const json = await res.json();
      return json.choices[0].message.content;
    } catch (err) {
      console.warn('OpenAiProvider falló o no tiene conexión, usando SimulatedAiProvider:', err);
      return new SimulatedAiProvider().complete(prompt);
    }
  }
}

export class SimulatedAiProvider implements AiProvider {
  async complete(prompt: string): Promise<string> {
    // Si el prompt solicita preguntas en JSON
    if (prompt.includes('preguntas') || prompt.includes('questions')) {
      const topicMatch = prompt.match(/sobre "(.*?)"/);
      const topic = topicMatch ? topicMatch[1] : 'Conceptos Clave';

      return JSON.stringify({
        questions: [
          {
            name: `[IA] Introducción a ${topic}`,
            text: `¿Cuál es el postulado principal o definición fundamental de ${topic}?`,
            options: [
              { text: `Es el concepto central que establece los principios de ${topic}.`, fraction: 1 },
              { text: `Es un fenómeno opuesto sin relación directa.`, fraction: 0 },
              { text: `Es una teoría obsoleta descartada.`, fraction: 0 },
              { text: `Ninguna de las anteriores.`, fraction: 0 },
            ],
          },
          {
            name: `[IA] Aplicación Práctica de ${topic}`,
            text: `En un contexto real, ¿cómo se aplica principalmente ${topic}?`,
            options: [
              { text: `Permite optimizar y estructurar procesos de forma eficiente.`, fraction: 1 },
              { text: `Solo se utiliza en entornos teóricos aislados.`, fraction: 0 },
              { text: `No tiene aplicaciones prácticas demostradas.`, fraction: 0 },
            ],
          },
        ],
      });
    }

    // Para mejora de texto
    return JSON.stringify({
      improvedText: `Esta es una versión enriquecida, estructurada y pedagógicamente optimizada para el aprendizaje efectivo.`,
    });
  }
}

export const ai: AiProvider = new OpenAiProvider();
