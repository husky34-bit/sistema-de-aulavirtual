// Motor de restricciones de acceso. Evalúa reglas recursivas
// (and/or) con condiciones de tipo date, completion y grade.

import { prisma } from '@/lib/prisma';

export interface AvailabilityCondition {
  type: 'date' | 'completion' | 'grade';
  // date: { after: ISO string }
  after?: string;
  // completion: { activityType, activityId }
  activityType?: string;
  activityId?: string;
  // grade: { activityType, activityId, minScore }
  minScore?: number;
}

export interface AvailabilityRule {
  op: 'and' | 'or';
  conditions: (AvailabilityCondition | AvailabilityRule)[];
}

export interface AccessResult {
  allowed: boolean;
  reasons: string[];
}

/**
 * Evalúa recursivamente si el usuario puede acceder según las reglas.
 */
export async function canAccess(
  userId: string,
  rule: AvailabilityRule,
  now: Date = new Date(),
): Promise<AccessResult> {
  const results: AccessResult[] = [];

  for (const condition of rule.conditions) {
    if ('op' in condition && (condition.op === 'and' || condition.op === 'or')) {
      results.push(await canAccess(userId, condition as AvailabilityRule, now));
    } else {
      results.push(await evaluateCondition(userId, condition as AvailabilityCondition, now));
    }
  }

  if (rule.op === 'and') {
    const allowed = results.every((r) => r.allowed);
    const reasons = results.filter((r) => !r.allowed).flatMap((r) => r.reasons);
    return { allowed, reasons };
  } else {
    const allowed = results.some((r) => r.allowed);
    const reasons = allowed ? [] : results.flatMap((r) => r.reasons);
    return { allowed, reasons };
  }
}

async function evaluateCondition(
  userId: string,
  condition: AvailabilityCondition,
  now: Date,
): Promise<AccessResult> {
  switch (condition.type) {
    case 'date': {
      if (!condition.after) return { allowed: true, reasons: [] };
      const afterDate = new Date(condition.after);
      if (now >= afterDate) return { allowed: true, reasons: [] };
      return {
        allowed: false,
        reasons: [`Disponible a partir del ${afterDate.toLocaleString()}`],
      };
    }

    case 'completion': {
      if (!condition.activityType || !condition.activityId) {
        return { allowed: true, reasons: [] };
      }
      const completion = await prisma.activityCompletion.findUnique({
        where: {
          userId_activityType_activityId: {
            userId,
            activityType: condition.activityType,
            activityId: condition.activityId,
          },
        },
        select: { completedAt: true },
      });
      if (completion?.completedAt) return { allowed: true, reasons: [] };
      return {
        allowed: false,
        reasons: ['Debes completar la actividad previa primero'],
      };
    }

    case 'grade': {
      if (!condition.activityType || !condition.activityId || condition.minScore === undefined) {
        return { allowed: true, reasons: [] };
      }
      const gradeItem = await prisma.gradeItem.findUnique({
        where: {
          sourceType_sourceId: {
            sourceType: condition.activityType as 'quiz' | 'assignment',
            sourceId: condition.activityId,
          },
        },
        select: { id: true, maxScore: true },
      });
      if (!gradeItem) return { allowed: false, reasons: ['Actividad de calificación no encontrada'] };

      const grade = await prisma.grade.findUnique({
        where: { gradeItemId_userId: { gradeItemId: gradeItem.id, userId } },
        select: { score: true },
      });
      if (grade?.score !== null && grade?.score !== undefined && grade.score >= (condition.minScore ?? 0)) {
        return { allowed: true, reasons: [] };
      }
      return {
        allowed: false,
        reasons: [`Requiere nota mínima de ${condition.minScore}`],
      };
    }

    default:
      return { allowed: true, reasons: [] };
  }
}
