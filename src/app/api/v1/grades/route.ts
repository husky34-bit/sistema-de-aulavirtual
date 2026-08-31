import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiToken } from '@/features/webservices/services/api-auth';

// GET /api/v1/grades — lista notas de un curso (query: courseId).
export async function GET(req: NextRequest) {
  const apiUser = await validateApiToken(req);
  if (!apiUser) {
    return NextResponse.json({ error: 'Token inválido o ausente' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');

  const grades = await prisma.grade.findMany({
    where: courseId ? { gradeItem: { courseId } } : undefined,
    select: {
      id: true,
      gradeItemId: true,
      userId: true,
      score: true,
      overridden: true,
      gradeItem: { select: { name: true, maxScore: true, sourceType: true } },
    },
    take: 200,
  });

  return NextResponse.json({ grades });
}
