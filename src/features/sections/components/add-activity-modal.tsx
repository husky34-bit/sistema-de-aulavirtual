"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addSectionActivity, ActivityType } from "../actions/add-section-activity";
import { PlusIcon } from "@/components/Icons";

interface AddActivityModalProps {
  courseId: string;
  sectionId: string;
  sectionTitle: string;
}

const ACTIVITY_TYPES: Array<{
  id: ActivityType;
  title: string;
  badge: string;
  icon: string;
  description: string;
  color: string;
}> = [
  {
    id: "assign",
    title: "Tarea o Laboratorio",
    badge: "Evaluación",
    icon: "📝",
    description: "Solicita entregables, proyectos prácticos o reportes de laboratorio con calificación.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "quiz",
    title: "Examen / Cuestionario",
    badge: "Evaluación",
    icon: "📋",
    description: "Evaluaciones cronometradas con banco de preguntas y corrección automática.",
    color: "from-indigo-600 to-purple-600",
  },
  {
    id: "page",
    title: "Página de Lectura / Lección",
    badge: "Material",
    icon: "📄",
    description: "Contenido formativo, guías paso a paso, código de ejemplo y explicaciones teóricas.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "url",
    title: "Enlace URL o Video",
    badge: "Recurso",
    icon: "🔗",
    description: "Vincula videos de YouTube, clases grabadas, repositorios de GitHub o documentación externa.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "forum",
    title: "Foro de Consultas y Debate",
    badge: "Interacción",
    icon: "💬",
    description: "Espacio de interacción para resolver dudas y debatir sobre los temas de la sección.",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "label",
    title: "Aviso o Texto Informativo",
    badge: "Separador",
    icon: "🏷️",
    description: "Añade notas, avisos importantes o subtítulos visibles directamente en la lista de módulos.",
    color: "from-slate-600 to-slate-800",
  },
];

export function AddActivityModal({ courseId, sectionId, sectionTitle }: AddActivityModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [timeLimitMin, setTimeLimitMin] = useState(30);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    setIsOpen(false);
    setSelectedType(null);
    setTitle("");
    setDescription("");
    setContent("");
    setUrl("");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;
    setError(null);

    startTransition(async () => {
      const res = await addSectionActivity({
        courseId,
        sectionId,
        type: selectedType,
        title,
        description,
        content,
        url,
        maxScore,
        timeLimitMin,
      });

      if (!res.success) {
        setError(res.error);
      } else {
        handleClose();
        router.refresh();
      }
    });
  };

  const activeActivityMeta = ACTIVITY_TYPES.find((a) => a.id === selectedType);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#026BCA]/30 bg-[#EDF6FF]/60 py-2.5 text-xs font-bold text-[#026BCA] transition hover:border-[#026BCA] hover:bg-[#EDF6FF] active:scale-[0.99] cursor-pointer font-poppins"
      >
        <PlusIcon size={16} />
        <span>Añadir una actividad o recurso a esta sección</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 font-poppins text-slate-800">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/20 bg-white p-6 md:p-8 shadow-2xl">
            {/* Header del Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#00155C]">
                  {selectedType ? activeActivityMeta?.title : "Añadir Actividad o Recurso"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sección: <strong className="text-slate-800">{sectionTitle}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            {!selectedType ? (
              /* PASO 1: Selector de tipo de actividad */
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Selecciona el tipo de contenido que deseas crear:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ACTIVITY_TYPES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedType(item.id);
                        setError(null);
                      }}
                      className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-left transition hover:border-[#026BCA] hover:bg-white hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                          {item.badge}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#00155C] group-hover:text-[#026BCA] transition">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* PASO 2: Formulario según el tipo seleccionado */
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="flex items-center gap-2 rounded-xl bg-[#EDF6FF] px-3.5 py-2 text-xs font-medium text-[#00155C]">
                  <span>{activeActivityMeta?.icon}</span>
                  <span>Configurando: <strong>{activeActivityMeta?.title}</strong></span>
                  <button
                    type="button"
                    onClick={() => setSelectedType(null)}
                    className="ml-auto text-[11px] font-bold text-[#026BCA] underline hover:text-[#00155C]"
                  >
                    Cambiar tipo
                  </button>
                </div>

                {selectedType !== "label" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Título de la actividad *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={
                        selectedType === "assign"
                          ? "Ej. Laboratorio 1: Análisis de Vulnerabilidades con Nmap"
                          : selectedType === "quiz"
                          ? "Ej. Examen Parcial de Ciberseguridad"
                          : selectedType === "page"
                          ? "Ej. Guía de Arquitectura de Microservicios"
                          : selectedType === "url"
                          ? "Ej. Grabación de la Sesión en Vivo 1 (YouTube)"
                          : "Ej. Foro de Dudas y Discusión del Módulo"
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
                    />
                  </div>
                )}

                {/* Campos específicos: URL */}
                {selectedType === "url" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Enlace URL Externo *
                    </label>
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... o https://docs.google.com/..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
                    />
                  </div>
                )}

                {/* Campos específicos: Tarea / Laboratorio */}
                {selectedType === "assign" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Puntaje Máximo (pts)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={maxScore}
                        onChange={(e) => setMaxScore(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Instrucciones breves
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ej. Subir archivo PDF o script comprimido"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
                      />
                    </div>
                  </div>
                )}

                {/* Campos específicos: Examen / Quiz */}
                {selectedType === "quiz" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Límite de tiempo (minutos)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={timeLimitMin}
                      onChange={(e) => setTimeLimitMin(Number(e.target.value))}
                      className="w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Una vez creado, podrás añadir preguntas interactivas desde el Banco de Preguntas.
                    </p>
                  </div>
                )}

                {/* Campos para Página / Lección o Etiqueta */}
                {(selectedType === "page" || selectedType === "label") && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      {selectedType === "page" ? "Contenido de la Lección *" : "Texto del Aviso / Etiqueta *"}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={
                        selectedType === "page"
                          ? "Escribe aquí la explicación, teoría, enlaces y detalles de la clase..."
                          : "Escribe un aviso o nota destacada para tus alumnos (ej: ⚠️ Recordar entregar la práctica antes del viernes)..."
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20 font-normal"
                    />
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedType(null)}
                    className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#026BCA] to-[#00BCE4] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#026BCA]/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isPending ? "Creando..." : "Crear y Añadir a Sección"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
