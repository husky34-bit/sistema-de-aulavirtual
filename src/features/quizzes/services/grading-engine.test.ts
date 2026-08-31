import { describe, it, expect } from 'vitest';
import { computeFinalGrade, normalizeAttemptGrade } from './grading-engine';

describe('grading-engine — computeFinalGrade()', () => {
  it('sin intentos devuelve finalGrade: null', () => {
    expect(computeFinalGrade('highest', [])).toEqual({
      finalGrade: null,
      attempts: 0,
    });
  });

  const sampleAttempts = [
    { attemptNumber: 1, grade: 60, finishedAt: new Date('2026-01-01') },
    { attemptNumber: 2, grade: 90, finishedAt: new Date('2026-01-02') },
    { attemptNumber: 3, grade: 75, finishedAt: new Date('2026-01-03') },
  ];

  it('highest toma la nota mayor (90)', () => {
    const res = computeFinalGrade('highest', sampleAttempts);
    expect(res.finalGrade).toBe(90);
    expect(res.attempts).toBe(3);
  });

  it('average calcula la media (75)', () => {
    const res = computeFinalGrade('average', sampleAttempts);
    expect(res.finalGrade).toBe(75);
  });

  it('first toma el primer intento (60)', () => {
    const res = computeFinalGrade('first', sampleAttempts);
    expect(res.finalGrade).toBe(60);
  });

  it('last toma el último intento (75)', () => {
    const res = computeFinalGrade('last', sampleAttempts);
    expect(res.finalGrade).toBe(75);
  });
});

describe('grading-engine — normalizeAttemptGrade()', () => {
  it('normaliza score a porcentaje 0..100', () => {
    expect(normalizeAttemptGrade(8, 10)).toBe(80);
    expect(normalizeAttemptGrade(15, 20)).toBe(75);
  });

  it('maneja nulos de forma segura', () => {
    expect(normalizeAttemptGrade(null, 10)).toBeNull();
    expect(normalizeAttemptGrade(8, null)).toBeNull();
    expect(normalizeAttemptGrade(8, 0)).toBeNull();
  });
});
