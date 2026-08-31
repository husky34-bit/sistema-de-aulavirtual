import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LinkIcon } from "@/components/Icons";

export default async function UrlResourcePage({
  params,
}: {
  params: Promise<{ id: string; urlId: string }>;
}) {
  await requireAuth();
  const { id: courseId, urlId } = await params;

  const url = await prisma.urlResource.findUnique({ where: { id: urlId } });
  if (!url) notFound();

  return (
    <div className="space-y-4">
      <Link href={`/dashboard/courses/${courseId}`} className="text-sm text-slate-500 hover:text-slate-900">
        ← Volver al curso
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><LinkIcon size={24} className="text-[#026BCA] shrink-0" /> {url.title}</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Enlace externo:</p>
        <a
          href={url.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block break-all text-blue-600 hover:underline"
        >
          {url.url}
        </a>
        <a
          href={url.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Abrir enlace
        </a>
      </div>
    </div>
  );
}
