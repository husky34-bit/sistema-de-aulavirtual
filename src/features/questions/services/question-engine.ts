import type { QuestionData } from '../schemas/question.schema';
import type { QuestionResponse, GradeResult, GraderContext } from '../types/question.types';
import { evaluateFormula } from './calculated-datasets';

function result(fraction: number, defaultScore: number, feedback?: string, manual = false): GradeResult {
  return {
    fraction,
    score: fraction * defaultScore,
    correct: fraction === 1,
    feedback,
    needsManualGrading: manual,
  };
}

function gradeMultichoice(
  data: Extract<QuestionData, { type: 'multichoice' }>,
  response: Extract<QuestionResponse, { kind: 'choice' }>,
  defaultScore: number
): GradeResult {
  const { options, single } = data;
  const selected = new Set(response.selected);

  if (single) {
    // Modo simple: una sola opción; su fraction es la nota
    const idx = response.selected[0];
    if (idx === undefined || !options[idx]) return result(0, defaultScore);
    return result(options[idx].fraction, defaultScore, options[idx].feedback);
  }

  // Modo múltiple: suma fracciones de marcadas, resta por incorrectas marcadas
  let fraction = 0;
  const correctCount = options.filter((o) => o.fraction > 0).length || 1;

  for (const i of selected) {
    const opt = options[i];
    if (!opt) continue;
    fraction += opt.fraction > 0 ? opt.fraction / correctCount : -0.5;
  }

  return result(Math.max(0, Math.min(1, fraction)), defaultScore);
}

function gradeTrueFalse(
  data: Extract<QuestionData, { type: 'truefalse' }>,
  response: Extract<QuestionResponse, { kind: 'boolean' }>,
  defaultScore: number
): GradeResult {
  const correct = response.value === data.correctAnswer;
  const feedback = correct ? data.feedbackTrue ?? data.feedbackFalse : data.feedbackFalse;
  return result(correct ? 1 : 0, defaultScore, feedback);
}

function gradeShortanswer(
  data: Extract<QuestionData, { type: 'shortanswer' }>,
  response: Extract<QuestionResponse, { kind: 'text' }>,
  defaultScore: number
): GradeResult {
  const normalize = (s: string) =>
    data.caseSensitive ? s.trim() : s.trim().toLowerCase();

  const value = normalize(response.value);

  for (const answer of data.answers) {
    const pattern = normalize(answer.text);
    if (pattern === '*') {
      // comodín: cualquier respuesta no vacía
      if (value.length > 0) return result(answer.fraction, defaultScore);
    } else if (pattern.includes('*')) {
      const regex = new RegExp(
        '^' + pattern.split('*').map(escapeRegex).join('.*') + '$',
        data.caseSensitive ? '' : 'i'
      );
      if (regex.test(response.value.trim())) return result(answer.fraction, defaultScore);
    } else if (pattern === value) {
      return result(answer.fraction, defaultScore);
    }
  }
  return result(0, defaultScore);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function gradeNumerical(
  data: Extract<QuestionData, { type: 'numerical' }>,
  response: Extract<QuestionResponse, { kind: 'number' }>,
  defaultScore: number
): GradeResult {
  const diff = Math.abs(response.value - data.answer);
  return result(diff <= data.tolerance ? 1 : 0, defaultScore);
}

// Punto de entrada único del motor para los 16 tipos
export function gradeQuestion(
  data: QuestionData,
  response: QuestionResponse,
  defaultScore: number,
  ctx: GraderContext = {}
): GradeResult {
  switch (data.type) {
    case 'multichoice':
      return response.kind === 'choice'
        ? gradeMultichoice(data, response, defaultScore)
        : result(0, defaultScore);

    case 'truefalse':
      return response.kind === 'boolean'
        ? gradeTrueFalse(data, response, defaultScore)
        : result(0, defaultScore);

    case 'shortanswer':
      return response.kind === 'text'
        ? gradeShortanswer(data, response, defaultScore)
        : result(0, defaultScore);

    case 'numerical':
      return response.kind === 'number'
        ? gradeNumerical(data, response, defaultScore)
        : result(0, defaultScore);

    case 'calculated': {
      if (response.kind !== 'number') return result(0, defaultScore);
      const expected = evaluateFormula(data.formula, ctx);
      if (expected === null) return result(0, defaultScore, 'Error en la fórmula', true);
      const diff = Math.abs(response.value - expected);
      return result(diff <= data.tolerance ? 1 : 0, defaultScore);
    }

    case 'essay': {
      if (response.kind !== 'essay') return result(0, defaultScore);
      const words = response.value.trim().split(/\s+/).filter(Boolean).length;
      if (words < data.minWords) {
        return result(0, defaultScore, `Mínimo ${data.minWords} palabras (llevas ${words})`, true);
      }
      return result(0, defaultScore, 'Pendiente de calificación manual', true);
    }

    case 'match': {
      if (response.kind !== 'pairs') return result(0, defaultScore);
      const total = data.pairs.length;
      let correct = 0;
      data.pairs.forEach((pair, leftIdx) => {
        const rightIdx = response.assignments[leftIdx];
        if (rightIdx === leftIdx) correct++;
      });
      return result(correct / total, defaultScore, `${correct}/${total} pares correctos`);
    }

    case 'ordering': {
      if (response.kind !== 'order') return result(0, defaultScore);
      const total = data.items.length;
      let correct = 0;
      for (let i = 0; i < total; i++) {
        if (response.positions[i] === i) correct++;
      }
      return result(correct / total, defaultScore);
    }

    case 'ddimageortext':
    case 'ddmarker':
    case 'ddwtos': {
      if (response.kind !== 'zones') return result(0, defaultScore);
      const total = data.items.length;
      let correct = 0;
      for (const item of data.items) {
        const placedIn = response.placements[item.correctZoneId] ?? [];
        if (placedIn.includes(item.id)) correct++;
      }
      return result(correct / total, defaultScore, `${correct}/${total} elementos bien ubicados`);
    }

    case 'gapselect':
    case 'multianswer': {
      if (response.kind !== 'gaps') return result(0, defaultScore);
      let fractionSum = 0;
      for (const gap of data.gaps) {
        const answer = response.answers[gap.gapNumber];
        const chosen = gap.options.find((o) => o.text === answer);
        fractionSum += chosen?.fraction ?? 0;
      }
      return result(fractionSum / data.gaps.length, defaultScore);
    }

    default:
      return result(0, defaultScore, 'Tipo aún no evaluable', true);
  }
}
