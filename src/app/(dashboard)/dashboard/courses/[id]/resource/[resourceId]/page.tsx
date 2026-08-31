import { requireAuth } from "@/lib/auth-helpers";
import { getResource } from "@/features/resources/actions/get-resource";
import { markComplete } from "@/features/completion/services/completion-engine";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileTextIcon, DownloadIcon } from "@/components/Icons";

// Detecta si el MIME o la URL apuntan a un video de YouTube/Vimeo
function getEmbedSrc(mimeType: string, fileUrl: string): { type: "pdf" | "video" | "image" | "download"; src: string } {
  if (mimeType === "application/pdf") return { type: "pdf", src: fileUrl };
  if (mimeType.startsWith("image/")) return { type: "image", src: fileUrl };
  if (mimeType.startsWith("video/")) return { type: "video", src: fileUrl };
  return { type: "download", src: fileUrl };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ id: string; resourceId: string }>;
}) {
  const user = await requireAuth();
  const { id: courseId, resourceId } = await params;

  const result = await getResource(resourceId);
  if (!result.success) notFound();
  const r = result.data;

  // Marcar como completado al visualizar
  await markComplete({ userId: user.id, activityType: "resource", activityId: resourceId, courseId });

  const fileUrl = `/api/files/${r.file.id}`;
  const { type } = getEmbedSrc(r.file.mimeType, fileUrl);

  return (
    <div className="space-y-4 font-poppins">
      {/* Breadcrumb */}
      <Link
        href={`/dashboard/courses/${courseId}?tab=modules`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#026BCA] hover:text-[#00155C] transition"
      >
        ← Volver al aula
      </Link>

      {/* Header del recurso */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF6FF] text-[#00155C]">
            <FileTextIcon size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#00155C]">{r.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {r.file.filename} · {r.file.mimeType} · {(r.file.sizeBytes / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>

        {/* Descarga siempre disponible como opción secundaria */}
        <a
          href={fileUrl}
          download={r.file.filename}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:border-[#026BCA] hover:text-[#026BCA] transition shrink-0"
        >
          <DownloadIcon size={14} />
          Descargar
        </a>
      </div>

      {/* Visor embebido según tipo */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {type === "pdf" && (
          <iframe
            src={`${fileUrl}#view=FitH&toolbar=1`}
            title={r.title}
            className="w-full"
            style={{ height: "80vh", border: "none" }}
          />
        )}

        {type === "image" && (
          <div className="flex items-center justify-center bg-slate-50 p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl}
              alt={r.title}
              className="max-h-[70vh] w-auto max-w-full rounded-xl shadow-md object-contain"
            />
          </div>
        )}

        {type === "video" && (
          <div className="aspect-video bg-black">
            <video
              src={fileUrl}
              controls
              className="h-full w-full"
              title={r.title}
            />
          </div>
        )}

        {type === "download" && (
          <div className="flex flex-col items-center justify-center gap-6 p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDF6FF] text-[#00155C]">
              <FileTextIcon size={32} />
            </div>
            <div>
              <p className="text-base font-bold text-[#00155C]">{r.file.filename}</p>
              <p className="mt-1 text-xs text-slate-500">
                Este tipo de archivo ({r.file.mimeType}) no tiene previsualización disponible.<br />
                Descárgalo para abrirlo con la aplicación correspondiente.
              </p>
            </div>
            <a
              href={fileUrl}
              download={r.file.filename}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00155C] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#026BCA] transition"
            >
              <DownloadIcon size={16} />
              Descargar archivo
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
