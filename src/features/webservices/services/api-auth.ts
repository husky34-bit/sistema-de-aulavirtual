// Servicio de autenticación de API REST externa.
// Genera tokens con prefijo znv_ y valida tokens Bearer.

import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

const TOKEN_PREFIX = 'znv_';

/**
 * Genera un nuevo token de API (formato znv_ + 32 bytes hex).
 */
export function generateApiToken(): string {
  return TOKEN_PREFIX + randomBytes(16).toString('hex');
}

export interface ApiUser {
  userId: string;
  tokenName: string;
  scopes: string[];
}

/**
 * Valida un token Bearer en la petición.
 * Excluye tokens revocados. Retorna null si no es válido.
 */
export async function validateApiToken(req: NextRequest): Promise<ApiUser | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token.startsWith(TOKEN_PREFIX)) {
    return null;
  }

  const apiToken = await prisma.apiToken.findUnique({
    where: { token },
    select: { id: true, userId: true, name: true, scopes: true, revokedAt: true },
  });

  if (!apiToken || apiToken.revokedAt) {
    return null;
  }

  return {
    userId: apiToken.userId,
    tokenName: apiToken.name,
    scopes: apiToken.scopes,
  };
}
