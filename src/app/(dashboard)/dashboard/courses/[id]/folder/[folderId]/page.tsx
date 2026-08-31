import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FolderIcon, FileTextIcon } from "@/components/Icons";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ id: string; folderId: string }>;
}) {
  await requireAuth();
  const { id: courseId, folderId } = await params;

  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder) notFound();

  const files = folder.fileIds.length
    ? await prisma.storedFile.findMany({
        where: { id: { in: folder.fileIds } },
        select: { id: true, filename: true, mimeType: true, sizeBytes: true },
      })
    : [];

  return (
    <div className="space-y-4">
      <Link href={`/dashboard/courses/${courseId}`} className="text-sm text-slate-500 hover:text-slate-900">
        ← Volver al curso
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><FolderIcon size={24} className="text-[#026BCA] shrink-0" /> {folder.title}</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        {files.length === 0 ? (
          <p className="text-sm text-slate-500">Carpeta vacía.</p>
        ) : (
          <div className="space-y-2">
            {files.map((f) => (
              <a
                key={f.id}
                href={`/api/files/${f.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm transition hover:bg-slate-50"
              >
                <FileTextIcon size={18} className="text-slate-400 shrink-0" />
                <span className="font-medium text-slate-900">{f.filename}</span>
                <span className="text-slate-400">
                  {f.mimeType} · {(f.sizeBytes / 1024).toFixed(1)} KB
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
