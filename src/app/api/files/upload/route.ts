import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';
import { storage, makeStorageKey } from '@/features/resources/services/file-storage';

// Tipos MIME permitidos
const ALLOWED_MIME = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'video/mp4',
  'audio/mpeg',
  'text/plain',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  const contextType = formData.get('contextType') as string | null;
  const contextId = formData.get('contextId') as string | null;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Archivo no enviado' }, { status: 400 });
  }
  if (!contextType || !contextId) {
    return NextResponse.json(
      { error: 'Falta contextType o contextId' },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'El archivo excede 50 MB' },
      { status: 413 },
    );
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: `Tipo MIME no permitido: ${file.type}` },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storageKey = makeStorageKey(file.name);

  await storage.put(buffer, storageKey);

  const stored = await prisma.storedFile.create({
    data: {
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      storagePath: storageKey,
      contextType,
      contextId,
      uploadedById: user.id,
    },
  });

  return NextResponse.json({ fileId: stored.id });
}
