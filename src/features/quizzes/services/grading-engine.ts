// Cálculo de la nota final de un quiz sobre los intentos finalizados,
// según el método de calificación (gradeMethod) configurado.
//
// La nota de cada intento se normaliza a 0..100 (porcentaje del máximo).

export type GradeMethod = 'highest' | 'average' | 'first' | 'last';

export interface FinishedAttemptGrade {
  attemptNumber: number;
  // porcentaje 0..100
  grade: number;
  finishedAt: Date;
}

export interface FinalGradeResult {
  // porcentaje 0..100 (null si no hay intentos finalizados)
  finalGrade: number | null;
  // intentos considerados
  attempts: number;
}

// Normaliza el puntaje crudo de un intento a 0..100.
export function normalizeAttemptGrade(
  totalScore: number | null,
  maxScore: number | null
): number | null {
  if (totalScore === null) return null;
  if (maxScore === null || maxScore <= 0) return null;
  return Math.max(0, Math.min(100, (totalScore / maxScore) * 100));
}

export function computeFinalGrade(
  method: GradeMethod,
  attempts: FinishedAttemptGrade[]
): FinalGradeResult {
  if (attempts.length === 0) {
    return { finalGrade: null, attempts: 0 };
  }

  switch (method) {
    case 'highest':
      return {
        finalGrade: Math.max(...attempts.map((a) => a.grade)),
        attempts: attempts.length,
      };

    case 'average': {
      const sum = attempts.reduce((acc, a) => acc + a.grade, 0);
      return {
        finalGrade: sum / attempts.length,
        attempts: attempts.length,
      };
    }

    case 'first': {
      const first = [...attempts].sort(
        (a, b) => a.attemptNumber - b.attemptNumber
      )[0];
      return { finalGrade: first.grade, attempts: attempts.length };
    }

    case 'last': {
      const last = [...attempts].sort(
        (a, b) => b.attemptNumber - a.attemptNumber
      )[0];
      return { finalGrade: last.grade, attempts: attempts.length };
    }

    default:
      return { finalGrade: null, attempts: attempts.length };
  }
}
