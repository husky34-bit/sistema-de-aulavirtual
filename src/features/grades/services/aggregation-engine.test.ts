import { describe, it, expect } from 'vitest';
import { aggregate } from './aggregation-engine';

describe('aggregation-engine — aggregate()', () => {
  it('retorna null si todas las entradas son null', () => {
    const res = aggregate(
      [
        { fraction: null, weight: 1 },
        { fraction: null, weight: 2 },
      ],
      'mean',
    );
    expect(res.value).toBeNull();
    expect(res.count).toBe(0);
  });

  it('mean calcula el promedio simple normalizado a 100', () => {
    const res = aggregate(
      [
        { fraction: 0.8, weight: 1 },
        { fraction: 1.0, weight: 1 },
        { fraction: null, weight: 1 },
      ],
      'mean',
    );
    expect(res.value).toBe(90);
    expect(res.count).toBe(2);
  });

  it('weighted calcula la media ponderada', () => {
    const res = aggregate(
      [
        { fraction: 1.0, weight: 1 }, // 100 * 1 = 1
        { fraction: 0.5, weight: 3 }, // 0.5 * 3 = 1.5
      ],
      'weighted',
    );
    // (1 + 1.5) / 4 = 2.5 / 4 = 0.625 => 62.5%
    expect(res.value).toBe(62.5);
    expect(res.count).toBe(2);
  });

  it('median calcula la mediana correctamente', () => {
    const res = aggregate(
      [
        { fraction: 0.2, weight: 1 },
        { fraction: 0.6, weight: 1 },
        { fraction: 0.9, weight: 1 },
      ],
      'median',
    );
    expect(res.value).toBe(60);
  });

  it('max y min retornan los extremos', () => {
    const entries = [
      { fraction: 0.3, weight: 1 },
      { fraction: 0.7, weight: 1 },
      { fraction: 0.5, weight: 1 },
    ];
    expect(aggregate(entries, 'max').value).toBe(70);
    expect(aggregate(entries, 'min').value).toBe(30);
  });
});
