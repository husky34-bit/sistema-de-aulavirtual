import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiToken } from '@/features/webservices/services/api-auth';

// GET /api/v1/courses/[id] — detalle de un curso.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const apiUser = await validateApiToken(req);
  if (!apiUser) {
    return NextResponse.json({ error: 'Token inválido o ausente' }, { status: 401 });
  }

  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      published: true,
      createdAt: true,
      instructor: { select: { id: true, name: true, email: true } },
      sections: { orderBy: { position: 'asc' }, select: { id: true, title: true, position: true } },
      _count: { select: { enrollments: true, quizzes: true, assignments: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ course });
}
