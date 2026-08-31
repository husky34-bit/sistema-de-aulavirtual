import { describe, it, expect } from 'vitest';
import { SimulatedAiProvider } from '../services/ai-provider';

describe('ai-provider — SimulatedAiProvider', () => {
  it('genera estructura JSON válida para preguntas', async () => {
    const provider = new SimulatedAiProvider();
    const raw = await provider.complete('Genera 2 preguntas sobre "Álgebra Lineal" en español.');
    const parsed = JSON.parse(raw);

    expect(parsed.questions).toBeDefined();
    expect(parsed.questions.length).toBeGreaterThan(0);
    expect(parsed.questions[0].options.length).toBeGreaterThan(0);

    const hasCorrect = parsed.questions[0].options.some(
      (opt: { fraction: number }) => opt.fraction === 1
    );
    expect(hasCorrect).toBe(true);
  });

  it('genera texto mejorado cuando no pide preguntas', async () => {
    const provider = new SimulatedAiProvider();
    const raw = await provider.complete('Mejora este texto');
    const parsed = JSON.parse(raw);
    expect(parsed.improvedText).toBeDefined();
  });
});
