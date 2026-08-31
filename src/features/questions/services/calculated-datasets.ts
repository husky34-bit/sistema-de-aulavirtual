import type { GraderContext } from '../types/question.types';

interface VariableDef {
  name: string;
  min: number;
  max: number;
  decimals: number;
}

// Genera un valor aleatorio por variable para un intento concreto
export function generateDatasetValues(variables: VariableDef[]): GraderContext {
  const values: Record<string, number> = {};
  for (const v of variables) {
    const raw = v.min + Math.random() * (v.max - v.min);
    values[v.name] = Number(raw.toFixed(v.decimals));
  }
  return { datasetValues: values };
}

// Sustituye {a}, {b}... en el enunciado con los valores del intento
export function interpolateText(text: string, ctx: GraderContext): string {
  let out = text;
  for (const [name, value] of Object.entries(ctx.datasetValues ?? {})) {
    out = out.replaceAll(`{${name}}`, String(value));
  }
  return out;
}

// Evalúa la fórmula con los valores asignados. Seguro: solo números y operadores.
export function evaluateFormula(formula: string, ctx: GraderContext): number | null {
  let expr = formula;
  for (const [name, value] of Object.entries(ctx.datasetValues ?? {})) {
    expr = expr.replaceAll(`{${name}}`, String(value));
  }

  // whitelist: solo dígitos, operadores, puntos, paréntesis y espacios
  if (!/^[\d+\-*/().\s]+$/.test(expr)) return null;

  try {
    const result = new Function(`return (${expr})`)() as number;
    return Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}
