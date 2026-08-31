import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiToken } from '@/features/webservices/services/api-auth';
import type { NextRequest } from 'next/server';

// GET /api/v1/users — lista usuarios (requiere scope 'users').
export async function GET(req: NextRequest) {
  const apiUser = await validateApiToken(req);
  if (!apiUser) {
    return NextResponse.json({ error: 'Token inválido o ausente' }, { status: 401 });
  }
  if (!apiUser.scopes.includes('users') && !apiUser.scopes.includes('*')) {
    return NextResponse.json({ error: 'Scope insuficiente' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { email: 'asc' },
    take: 100,
  });

  return NextResponse.json({ users });
}
