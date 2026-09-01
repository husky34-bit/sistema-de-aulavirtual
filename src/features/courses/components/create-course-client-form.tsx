"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "../actions/create-course";
import { BookOpenIcon, CheckCircleIcon } from "@/components/Icons";

const PRESET_COVERS = [
  {
    label: "Ciberseguridad & Pentesting",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
    area: "ciberseguridad",
  },
  {
    label: "Cloud Computing & DevOps",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    area: "cloud",
  },
  {
    label: "BIM & Arquitectura 3D",
    url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80",
    area: "bim",
  },
  {
    label: "Gestión de Proyectos (PMP)",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    area: "pmp",
  },
  {
    label: "Programación & Desarrollo IA",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    area: "desarrollo",
  },
  {
    label: "Data Analytics & Power BI",
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    area: "bi",
  },
];

interface TeacherOption {
  id: string;
  name: string | null;
  email: string;
}

interface CreateCourseClientFormProps {
  teachers?: TeacherOption[];
}

export function CreateCourseClientForm({ teachers = [] }: CreateCourseClientFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [description, setDescription] = useState("");
  const [instructorId, setInstructorId] = useState(teachers[0]?.id ?? "");
  const [imageUrl, setImageUrl] = useState(PRESET_COVERS[0].url);
  const [area, setArea] = useState(PRESET_COVERS[0].area);
  const [level, setLevel] = useState("intermedio");
  const [modality, setModality] = useState("live");
  const [published, setPublished] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      const generatedSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generatedSlug || "");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    if (description) formData.append("description", description);
    if (instructorId) formData.append("instructorId", instructorId);
    if (imageUrl) formData.append("imageUrl", imageUrl);
    if (area) formData.append("area", area);
    if (level) formData.append("level", level);
    if (modality) formData.append("modality", modality);
    if (published) formData.append("published", "on");

    startTransition(async () => {
      const result = await createCourse(formData);
      if (result.success) {
        router.push(`/dashboard/courses/${result.courseId}`);
      } else {
        const errorMsg = result.errors
          ? Object.values(result.errors).flat().join(". ")
          : "Error al crear el curso";
        setError(errorMsg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-poppins">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Información Básica */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[#00155C] border-b border-slate-100 pb-3">
          1. Datos Principales del Curso
        </h2>

        {/* Asignar Docente / Instructor */}
        {teachers.length > 0 && (
          <div>
            <label htmlFor="instructorId" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Docente / Instructor Asignado *
            </label>
            <select
              id="instructorId"
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name ?? t.email} ({t.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Título del Curso / Programa *
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ej. Certified Ethical Hacker (CEH v13) - EC-Council"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Identificador URL (Slug) *
            </label>
            <button
              type="button"
              onClick={() => setAutoSlug(!autoSlug)}
              className="text-[11px] text-[#026BCA] hover:underline"
            >
              {autoSlug ? "Personalizar slug" : "Generar automáticamente"}
            </button>
          </div>
          <input
            id="slug"
            required
            value={slug}
            onChange={(e) => {
              setAutoSlug(false);
              setSlug(e.target.value);
            }}
            placeholder="ej. ceh-v13-ethical-hacker"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Descripción y Objetivos del Curso
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe las competencias, certificaciones o habilidades que obtendrá el estudiante..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
          />
        </div>
      </div>

      {/* Imagen Representativa del Curso */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[#00155C] border-b border-slate-100 pb-3">
          2. Imagen de Portada del Curso
        </h2>

        <div>
          <p className="text-xs text-slate-600 mb-3">
            Elige una portada representativa de alta calidad o ingresa tu propio enlace de imagen:
          </p>

          {/* Grid de Portadas Predeterminadas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {PRESET_COVERS.map((preset) => {
              const isSelected = imageUrl === preset.url;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setImageUrl(preset.url);
                    setArea(preset.area);
                  }}
                  className={`group relative overflow-hidden rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-[#026BCA] ring-2 ring-[#026BCA]/30 scale-[1.02]"
                      : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="h-20 w-full object-cover"
                  />
                  <div className="p-2 bg-white">
                    <p className="text-[11px] font-bold text-[#00155C] truncate">{preset.label}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 rounded-full bg-[#026BCA] text-white p-0.5 shadow">
                      <CheckCircleIcon size={14} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <label htmlFor="imageUrl" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            O pega una URL personalizada de imagen (Recomendado: 280 × 280 px cuadrado)
          </label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://ejemplo.com/caratula-280x280.jpg"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
          />
        </div>

        {/* Vista previa en vivo (Cuadrada 280x280) */}
        {imageUrl && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Vista previa de la tarjeta (Formato 280 × 280):
            </p>
            <div className="w-64 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md">
              <div className="aspect-square w-full overflow-hidden bg-[#00155C]">
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-[#00155C] line-clamp-1">
                  {title || "Título del curso"}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                  {description || "Descripción del programa académico..."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clasificación y Publicación */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[#00155C] border-b border-slate-100 pb-3">
          3. Modalidad y Publicación
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Área de Especialidad
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none"
            >
              <option value="ciberseguridad">Ciberseguridad</option>
              <option value="cloud">Cloud & DevOps</option>
              <option value="bim">BIM & Arquitectura</option>
              <option value="pmp">Gestión de Proyectos (PMP)</option>
              <option value="desarrollo">Programación & IA</option>
              <option value="bi">Power BI & Analytics</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Modalidad
            </label>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none"
            >
              <option value="live">Virtual en Vivo (Clases síncronas)</option>
              <option value="async">A tu Propio Ritmo (Asíncrono)</option>
              <option value="hybrid">Híbrido</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nivel
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none"
            >
              <option value="basico">Básico / Inicial</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado / Profesional</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#026BCA] focus:ring-[#026BCA]"
            />
            <span className="text-xs font-semibold text-slate-700">
              Publicar curso inmediatamente en el catálogo de estudiantes
            </span>
          </label>
        </div>
      </div>

      {/* Botón Final de Creación */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl px-5 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#026BCA] via-[#10A3CA] to-[#00BCE4] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#026BCA]/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <BookOpenIcon size={18} />
          <span>{isPending ? "Creando curso..." : "Crear Curso"}</span>
        </button>
      </div>
    </form>
  );
}
