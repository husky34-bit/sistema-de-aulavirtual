import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiToken } from '@/features/webservices/services/api-auth';

// GET /api/v1/completion — lista finalización de actividades (query: courseId).
export async function GET(req: NextRequest) {
  const apiUser = await validateApiToken(req);
  if (!apiUser) {
    return NextResponse.json({ error: 'Token inválido o ausente' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');

  const completions = await prisma.activityCompletion.findMany({
    where: {
      ...(courseId ? { courseId } : {}),
      completedAt: { not: null },
    },
    select: {
      id: true,
      userId: true,
      activityType: true,
      activityId: true,
      courseId: true,
      completedAt: true,
    },
    take: 200,
  });

  return NextResponse.json({ completions });
}
