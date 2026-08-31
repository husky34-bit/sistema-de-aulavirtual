'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { generateApiToken } from '@/features/webservices/services/api-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const createTokenSchema = z.object({
  name: z.string().min(1).max(120),
  scopes: z.array(z.string()).default([]),
});

// Crea un nuevo token de API.
export async function createApiToken(input: unknown) {
  const user = await requireAuth();
  const validated = createTokenSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { name, scopes } = validated.data;
  const token = generateApiToken();

  const apiToken = await prisma.apiToken.create({
    data: { token, name, userId: user.id, scopes },
  });

  revalidatePath('/dashboard/settings/tokens');
  return { success: true as const, token, tokenId: apiToken.id };
}

// Revoca un token (no lo elimina, marca revokedAt).
export async function revokeApiToken(tokenId: string) {
  const user = await requireAuth();
  const token = await prisma.apiToken.findUnique({
    where: { id: tokenId },
    select: { userId: true },
  });
  if (!token) return { success: false as const, error: 'Token no encontrado' };
  if (token.userId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  await prisma.apiToken.update({
    where: { id: tokenId },
    data: { revokedAt: new Date() },
  });

  revalidatePath('/dashboard/settings/tokens');
  return { success: true as const };
}

// Lista los tokens del usuario.
export async function getApiTokens() {
  const user = await requireAuth();
  const tokens = await prisma.apiToken.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, scopes: true, revokedAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return { success: true as const, data: tokens };
}
