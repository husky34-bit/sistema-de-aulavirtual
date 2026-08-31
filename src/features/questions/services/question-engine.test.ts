import { describe, it, expect } from 'vitest';
import { gradeQuestion } from './question-engine';

describe('gradeQuestion — multichoice', () => {
  const data = {
    type: 'multichoice' as const,
    single: true,
    shuffle: false,
    options: [
      { text: '3', fraction: 0 },
      { text: '4', fraction: 1 },
    ],
  };

  it('respuesta correcta da fraction 1', () => {
    const r = gradeQuestion(data, { kind: 'choice', selected: [1] }, 2);
    expect(r.fraction).toBe(1);
    expect(r.score).toBe(2);
    expect(r.correct).toBe(true);
  });

  it('respuesta incorrecta da fraction 0', () => {
    const r = gradeQuestion(data, { kind: 'choice', selected: [0] }, 2);
    expect(r.fraction).toBe(0);
    expect(r.score).toBe(0);
    expect(r.correct).toBe(false);
  });

  it('sin respuesta da fraction 0', () => {
    const r = gradeQuestion(data, { kind: 'choice', selected: [] }, 2);
    expect(r.fraction).toBe(0);
  });
});

describe('gradeQuestion — numerical', () => {
  const data = { type: 'numerical' as const, answer: 3.14, tolerance: 0.01 };

  it('dentro de tolerancia es correcto', () => {
    expect(gradeQuestion(data, { kind: 'number', value: 3.141 }, 1).fraction).toBe(1);
  });

  it('fuera de tolerancia es incorrecto', () => {
    expect(gradeQuestion(data, { kind: 'number', value: 3.2 }, 1).fraction).toBe(0);
  });

  it('tolerancia cero exige exactitud', () => {
    const strict = { ...data, tolerance: 0 };
    expect(gradeQuestion(strict, { kind: 'number', value: 3.14 }, 1).fraction).toBe(1);
    expect(gradeQuestion(strict, { kind: 'number', value: 3.140001 }, 1).fraction).toBe(0);
  });
});

describe('gradeQuestion — shortanswer', () => {
  const data = {
    type: 'shortanswer' as const,
    caseSensitive: false,
    answers: [{ text: 'paris', fraction: 1 }],
  };

  it('ignora mayúsculas y espacios por defecto', () => {
    expect(gradeQuestion(data, { kind: 'text', value: '  PARIS ' }, 1).fraction).toBe(1);
  });

  it('comodín * acepta cualquier no vacía', () => {
    const wildcard = { ...data, answers: [{ text: '*', fraction: 0.5 }] };
    expect(gradeQuestion(wildcard, { kind: 'text', value: 'lo que sea' }, 1).fraction).toBe(0.5);
  });
});

describe('gradeQuestion — truefalse', () => {
  const data = {
    type: 'truefalse' as const,
    correctAnswer: true,
    feedbackTrue: 'Correcto',
    feedbackFalse: 'Incorrecto',
  };

  it('acertar da fraction 1', () => {
    expect(gradeQuestion(data, { kind: 'boolean', value: true }, 5).fraction).toBe(1);
  });

  it('fallar da fraction 0', () => {
    expect(gradeQuestion(data, { kind: 'boolean', value: false }, 5).fraction).toBe(0);
  });
});

describe('gradeQuestion — essay', () => {
  it('marca needsManualGrading', () => {
    const data = { type: 'essay' as const, minWords: 0, allowAttachments: false };
    const r = gradeQuestion(data, { kind: 'essay', value: 'texto' }, 5);
    expect(r.needsManualGrading).toBe(true);
  });
});
