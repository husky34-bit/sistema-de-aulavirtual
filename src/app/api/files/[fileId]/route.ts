import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';
import { storage } from '@/features/resources/services/file-storage';
import type { Role } from '@/generated/prisma/client';

// Verifica el acceso del usuario al archivo según su contexto.
async function canAccessFile(
  userId: string,
  role: Role,
  file: { contextType: string; contextId: string; uploadedById: string },
): Promise<boolean> {
  // Admins y managers siempre tienen acceso
  if (role === 'ADMIN' || role === 'MANAGER') return true;
  // El uploader siempre tiene acceso a sus archivos
  if (file.uploadedById === userId) return true;

  // Por contexto de curso: matriculado o instructor
  if (file.contextType === 'course' || file.contextType === 'activity') {
    const courseId = file.contextId;
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });
    if (enrollment) return true;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });
    if (course?.instructorId === userId) return true;
  }

  return false;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { fileId } = await params;
  const file = await prisma.storedFile.findUnique({
    where: { id: fileId },
    select: { filename: true, mimeType: true, storagePath: true, contextType: true, contextId: true, uploadedById: true },
  });
  if (!file) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
  }

  const allowed = await canAccessFile(user.id, user.role, file);
  if (!allowed) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const buffer = await storage.get(file.storagePath);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Content-Length': String(buffer.length),
    },
  });
}
