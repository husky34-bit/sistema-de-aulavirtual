// Motor de agregación del Gradebook.
// Función PURA: dadas las entradas (fracciones 0..1 de cada ítem) y el método,
// calcula el agregado normalizado a 100. Excluye entradas nulas.

import type { AggregationType } from '../schemas/grade.schema';

// Una entrada de calificación para el motor de agregación.
// `fraction` es el puntaje obtenido / maxScore (0..1).
// `weight` es el peso del ítem (usado solo por `weighted`).
export interface AggregationEntry {
  // fracción obtenida 0..1 (null => sin calificación, se excluye)
  fraction: number | null;
  // peso del ítem (usado solo en `weighted`)
  weight: number;
}

export interface AggregationResult {
  // agregado normalizado a 0..100 (null si no hay entradas válidas)
  value: number | null;
  // número de entradas consideradas (no nulas)
  count: number;
}

/**
 * Agrega las entradas según el método configurado.
 * Excluye las entradas con `fraction` null.
 * El resultado se normaliza a 0..100.
 */
export function aggregate(
  entries: AggregationEntry[],
  method: AggregationType,
): AggregationResult {
  const valid = entries.filter((e) => e.fraction !== null) as {
    fraction: number;
    weight: number;
  }[];

  if (valid.length === 0) {
    return { value: null, count: 0 };
  }

  switch (method) {
    case 'mean': {
      const sum = valid.reduce((acc, e) => acc + e.fraction, 0);
      return { value: (sum / valid.length) * 100, count: valid.length };
    }

    case 'weighted': {
      const totalWeight = valid.reduce((acc, e) => acc + (e.weight || 0), 0);
      if (totalWeight <= 0) {
        // sin pesos: cae al promedio simple
        const sum = valid.reduce((acc, e) => acc + e.fraction, 0);
        return { value: (sum / valid.length) * 100, count: valid.length };
      }
      const weightedSum = valid.reduce(
        (acc, e) => acc + e.fraction * (e.weight || 0),
        0,
      );
      return { value: (weightedSum / totalWeight) * 100, count: valid.length };
    }

    case 'median': {
      const sorted = [...valid].sort((a, b) => a.fraction - b.fraction);
      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length % 2 === 0
          ? (sorted[mid - 1].fraction + sorted[mid].fraction) / 2
          : sorted[mid].fraction;
      return { value: median * 100, count: valid.length };
    }

    case 'sum': {
      // suma directa de fracciones; normalizada al número de ítems (0..100)
      const sum = valid.reduce((acc, e) => acc + e.fraction, 0);
      return { value: (sum / valid.length) * 100, count: valid.length };
    }

    case 'max': {
      const max = Math.max(...valid.map((e) => e.fraction));
      return { value: max * 100, count: valid.length };
    }

    case 'min': {
      const min = Math.min(...valid.map((e) => e.fraction));
      return { value: min * 100, count: valid.length };
    }

    case 'mode': {
      // nota más frecuente (redondeada a 2 decimales para agrupar)
      const rounded = valid.map((e) => Math.round(e.fraction * 100) / 100);
      const counts = new Map<number, number>();
      for (const r of rounded) {
        counts.set(r, (counts.get(r) ?? 0) + 1);
      }
      let mode = rounded[0];
      let maxCount = 0;
      for (const [val, count] of counts) {
        if (count > maxCount) {
          maxCount = count;
          mode = val;
        }
      }
      return { value: mode * 100, count: valid.length };
    }

    default:
      return { value: null, count: valid.length };
  }
}
