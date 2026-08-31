import { describe, it, expect } from 'vitest';
import {
  generateDatasetValues,
  interpolateText,
  evaluateFormula,
} from './calculated-datasets';

describe('calculated-datasets — generateDatasetValues()', () => {
  it('genera números dentro del rango y con decimales correctos', () => {
    const vars = [
      { name: 'a', min: 10, max: 20, decimals: 2 },
      { name: 'b', min: 1, max: 5, decimals: 0 },
    ];
    const ctx = generateDatasetValues(vars);
    expect(ctx.datasetValues?.a).toBeGreaterThanOrEqual(10);
    expect(ctx.datasetValues?.a).toBeLessThanOrEqual(20);
    expect(ctx.datasetValues?.b).toBeGreaterThanOrEqual(1);
    expect(ctx.datasetValues?.b).toBeLessThanOrEqual(5);
  });
});

describe('calculated-datasets — interpolateText()', () => {
  it('reemplaza variables correctamente en el enunciado', () => {
    const text = 'Si tienes {a} manzanas y compras {b} más';
    const ctx = { datasetValues: { a: 5, b: 3 } };
    expect(interpolateText(text, ctx)).toBe('Si tienes 5 manzanas y compras 3 más');
  });
});

describe('calculated-datasets — evaluateFormula() & Anti-Injection Guard', () => {
  it('evalúa operaciones aritméticas válidas', () => {
    const ctx = { datasetValues: { a: 10, b: 2 } };
    expect(evaluateFormula('{a} + {b} * 3', ctx)).toBe(16);
    expect(evaluateFormula('({a} - {b}) / 2', ctx)).toBe(4);
  });

  it('rechaza inyecciones de código malicioso', () => {
    const ctx = { datasetValues: { a: 10 } };
    // Inyección de función / JS arbitrario
    expect(evaluateFormula('{a}; process.exit()', ctx)).toBeNull();
    expect(evaluateFormula('alert(1)', ctx)).toBeNull();
    expect(evaluateFormula('window.location', ctx)).toBeNull();
    expect(evaluateFormula('{a} < 5 ? 1 : 2', ctx)).toBeNull();
  });
});
