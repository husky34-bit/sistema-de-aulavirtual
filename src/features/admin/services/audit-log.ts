// Servicio de logging de auditoría. Registra acciones sensibles.

import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export interface AuditLogInput {
  userId: string;
  action: string; // 'role_change' | 'grade_override' | 'user_delete' | ...
  entity: string; // 'user' | 'course' | 'grade' | ...
  entityId: string;
  details?: unknown;
}

/**
 * Registra una entrada en el log de auditoría.
 */
export async function logAction(input: AuditLogInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      details: input.details != null ? (input.details as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });
}
