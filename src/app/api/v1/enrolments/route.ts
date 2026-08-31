import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiToken } from '@/features/webservices/services/api-auth';

// GET /api/v1/enrolments — lista matrículas de un curso (query: courseId).
// POST /api/v1/enrolments — matricula un usuario (body: { userId, courseId }).
export async function GET(req: NextRequest) {
  const apiUser = await validateApiToken(req);
  if (!apiUser) {
    return NextResponse.json({ error: 'Token inválido o ausente' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');

  const enrollments = await prisma.enrollment.findMany({
    where: courseId ? { courseId } : undefined,
    select: {
      id: true,
      userId: true,
      courseId: true,
      enrolledAt: true,
      user: { select: { name: true, email: true } },
    },
    take: 200,
  });

  return NextResponse.json({ enrollments });
}

export async function POST(req: NextRequest) {
  const apiUser = await validateApiToken(req);
  if (!apiUser) {
    return NextResponse.json({ error: 'Token inválido o ausente' }, { status: 401 });
  }

  const body = await req.json();
  const { userId, courseId } = body;
  if (!userId || !courseId) {
    return NextResponse.json({ error: 'Faltan userId o courseId' }, { status: 400 });
  }

  try {
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });
    return NextResponse.json({ enrollment });
  } catch {
    return NextResponse.json({ error: 'No se pudo matricular' }, { status: 400 });
  }
}
