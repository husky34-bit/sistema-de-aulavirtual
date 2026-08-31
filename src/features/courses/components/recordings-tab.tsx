"use client";

import { useState, useTransition } from "react";
import { addRecording, deleteRecording } from "@/features/courses/actions/recording-actions";
import { TrashIcon, PlusIcon, VideoIcon } from "@/components/Icons";

interface Recording {
  id: string;
  title: string;
  videoUrl: string;
  provider: string;
  sessionDate: Date | null;
  createdAt: Date;
}

interface RecordingsTabProps {
  courseId: string;
  recordings: Recording[];
  canEdit: boolean;
}

function getEmbedUrl(url: string, provider: string): string | null {
  try {
    if (provider === "youtube" || url.includes("youtube.com") || url.includes("youtu.be")) {
      // Convertir a URL embed
      const ytMatch =
        url.match(/[?&]v=([^&]+)/) ||
        url.match(/youtu\.be\/([^?&]+)/) ||
        url.match(/embed\/([^?&]+)/);
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    }
    if (provider === "vimeo" || url.includes("vimeo.com")) {
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`;
    }
    // Cualquier otra URL (Zoom, Drive, etc.) → enlace externo
    return null;
  } catch {
    return null;
  }
}

export function RecordingsTab({ courseId, recordings, canEdit }: RecordingsTabProps) {
  const [list, setList] = useState<Recording[]>(recordings);
  const [showForm, setShowForm] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [provider, setProvider] = useState("youtube");
  const [sessionDate, setSessionDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await addRecording({ courseId, title, videoUrl, provider, sessionDate: sessionDate || undefined });
      if (res.success) {
        setList((prev) => [res.data, ...prev]);
        setTitle(""); setVideoUrl(""); setProvider("youtube"); setSessionDate("");
        setShowForm(false);
      } else {
        setError(res.error ?? "Error al guardar");
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteRecording(id);
      if (res.success) setList((prev) => prev.filter((r) => r.id !== id));
    });
  }

  return (
    <div className="space-y-6 font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[#00155C]">Grabaciones de Clases</h2>
          <p className="text-xs text-slate-500">Repasa las sesiones anteriores en cualquier momento</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00155C] to-[#026BCA] px-4 py-2 text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <PlusIcon size={14} />
            Agregar grabación
          </button>
        )}
      </div>

      {/* Formulario docente */}
      {canEdit && showForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl border border-[#D0E5F7] dark:border-[#1e3a61] bg-[#F0F7FD] dark:bg-[#0f223d] p-5 space-y-3"
        >
          <p className="text-xs font-bold text-[#00155C] uppercase tracking-wide">Nueva grabación</p>
          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Título de la sesión</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Sesión 3 — Escaneo de redes"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#101d31] px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#026BCA] focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha de sesión</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#101d31] px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:border-[#026BCA] focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Plataforma</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#101d31] px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:border-[#026BCA] focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="zoom">Zoom Cloud</option>
                <option value="other">Otro enlace</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">URL del video</label>
              <input
                required
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#101d31] px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#026BCA] focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#026BCA] px-5 py-2 text-xs font-bold text-white hover:bg-[#00155C] transition disabled:opacity-50"
            >
              {isPending ? "Guardando..." : "Guardar grabación"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de grabaciones */}
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF6FF] text-[#00155C]">
            <VideoIcon size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-[#00155C]">Sin grabaciones aún</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
            Las grabaciones de clases aparecerán aquí para que puedas repasar las sesiones anteriores.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {list.map((rec) => {
            const embedUrl = getEmbedUrl(rec.videoUrl, rec.provider);
            const isPlaying = activeId === rec.id;

            return (
              <div
                key={rec.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#026BCA] hover:shadow-md"
              >
                {/* Video embed */}
                <div className="relative aspect-video bg-[#000D23] overflow-hidden">
                  {isPlaying && embedUrl ? (
                    <iframe
                      src={embedUrl}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                      title={rec.title}
                    />
                  ) : (
                    <button
                      onClick={() => setActiveId(rec.id)}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white hover:bg-white/5 transition"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition">
                        <VideoIcon size={32} className="text-white ml-1" />
                      </div>
                      <span className="text-xs font-bold text-white/80">Reproducir grabación</span>
                    </button>
                  )}
                  {!embedUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <a
                        href={rec.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 transition"
                      >
                        <VideoIcon size={16} />
                        Ver en plataforma externa →
                      </a>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex items-start justify-between p-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#00155C] leading-snug">{rec.title}</h4>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {rec.sessionDate
                        ? new Date(rec.sessionDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
                        : new Date(rec.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      {" · "}
                      <span className="capitalize font-medium text-[#026BCA]">{rec.provider}</span>
                    </p>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(rec.id)}
                      disabled={isPending}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40"
                      title="Eliminar grabación"
                    >
                      <TrashIcon size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
