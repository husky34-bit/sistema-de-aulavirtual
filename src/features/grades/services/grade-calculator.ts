// Calculador en cascada del Gradebook.
// Resuelve de forma recursiva ítems directos y el árbol de categorías anidadas
// hasta obtener el total ponderado del curso para un estudiante.

import { prisma } from '@/lib/prisma';
import { aggregate, type AggregationEntry } from './aggregation-engine';
import type { AggregationType } from '../schemas/grade.schema';

interface CategoryNode {
  id: string;
  name: string;
  aggregation: AggregationType;
  weight: number;
  parentId: string | null;
}

interface ItemNode {
  id: string;
  name: string;
  categoryId: string | null;
  weight: number;
  maxScore: number;
}

/**
 * Computa el total del curso para un usuario resolviendo el árbol de categorías.
 * Las categorías hijas se agregan primero (recursión), luego sus ítems.
 * El total del curso es la agregación de las categorías raíz (parentId null).
 */
export async function computeCourseGrade(
  courseId: string,
  userId: string,
): Promise<{ value: number | null; count: number }> {
  const [categories, items, grades] = await Promise.all([
    prisma.gradeCategory.findMany({
      where: { courseId },
      select: { id: true, name: true, aggregation: true, parentId: true },
    }),
    prisma.gradeItem.findMany({
      where: { courseId },
      select: { id: true, name: true, categoryId: true, weight: true, maxScore: true },
    }),
    prisma.grade.findMany({
      where: { userId, gradeItem: { courseId } },
      select: { gradeItemId: true, userId: true, score: true },
    }),
  ]);

  const gradeMap = new Map<string, number | null>();
  for (const g of grades) {
    gradeMap.set(g.gradeItemId, g.score);
  }

  const categoryMap = new Map<string, CategoryNode>();
  for (const c of categories) {
    categoryMap.set(c.id, {
      id: c.id,
      name: c.name,
      aggregation: c.aggregation,
      weight: 1, // peso por defecto; las categorías raíz se promedian
      parentId: c.parentId,
    });
  }

  // Hijos por categoría
  const childrenByParent = new Map<string | null, string[]>();
  for (const c of categories) {
    const arr = childrenByParent.get(c.parentId) ?? [];
    arr.push(c.id);
    childrenByParent.set(c.parentId, arr);
  }

  // Ítems por categoría
  const itemsByCategory = new Map<string | null, ItemNode[]>();
  for (const it of items) {
    const arr = itemsByCategory.get(it.categoryId) ?? [];
    arr.push({
      id: it.id,
      name: it.name,
      categoryId: it.categoryId,
      weight: it.weight,
      maxScore: it.maxScore,
    });
    itemsByCategory.set(it.categoryId, arr);
  }

  // Cache de valor agregado por categoría (0..100)
  const memo = new Map<string, number | null>();

  function resolveCategory(catId: string): number | null {
    if (memo.has(catId)) return memo.get(catId)!;

    const cat = categoryMap.get(catId);
    if (!cat) return null;

    const entries: AggregationEntry[] = [];

    // Ítems directos de esta categoría
    for (const item of itemsByCategory.get(catId) ?? []) {
      const score = gradeMap.get(item.id) ?? null;
      const fraction =
        score === null || item.maxScore <= 0
          ? null
          : score / item.maxScore;
      entries.push({ fraction, weight: item.weight });
    }

    // Subcategorías (recursión) — su valor ya es 0..100, fracción = value/100
    for (const childId of childrenByParent.get(catId) ?? []) {
      const childValue = resolveCategory(childId);
      entries.push({
        fraction: childValue === null ? null : childValue / 100,
        weight: 1,
      });
    }

    const result = aggregate(entries, cat.aggregation).value;
    memo.set(catId, result);
    return result;
  }

  // Entradas de nivel raíz: ítems sin categoría + categorías raíz
  const rootEntries: AggregationEntry[] = [];

  // 1. Ítems sin categoría (van directo al total del curso)
  for (const item of itemsByCategory.get(null) ?? []) {
    const score = gradeMap.get(item.id) ?? null;
    const fraction =
      score === null || item.maxScore <= 0
        ? null
        : score / item.maxScore;
    rootEntries.push({ fraction, weight: item.weight });
  }

  // 2. Categorías raíz (parentId: null)
  for (const catId of childrenByParent.get(null) ?? []) {
    const catValue = resolveCategory(catId);
    rootEntries.push({
      fraction: catValue === null ? null : catValue / 100,
      weight: 1,
    });
  }

  // El curso se agrega como promedio ponderado de las entradas raíz
  const courseResult = aggregate(rootEntries, 'weighted');
  return { value: courseResult.value, count: courseResult.count };
}

/**
 * Calcula la nota de un ítem individual como fracción (0..1) o null.
 */
export function itemFraction(
  score: number | null,
  maxScore: number,
): number | null {
  if (score === null) return null;
  if (maxScore <= 0) return null;
  return Math.max(0, Math.min(1, score / maxScore));
}
