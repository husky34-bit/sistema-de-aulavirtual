import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiToken } from '@/features/webservices/services/api-auth';

// GET /api/v1/courses — lista todos los cursos publicados.
export async function GET(req: NextRequest) {
  const apiUser = await validateApiToken(req);
  if (!apiUser) {
    return NextResponse.json({ error: 'Token inválido o ausente' }, { status: 401 });
  }

  const courses = await prisma.course.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      published: true,
      createdAt: true,
      instructor: { select: { id: true, name: true, email: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { title: 'asc' },
  });

  return NextResponse.json({ courses });
}
