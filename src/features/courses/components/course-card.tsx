import Link from "next/link";
import { BookOpenIcon, UsersIcon, CheckCircleIcon, LayersIcon } from "@/components/Icons";
import type { CourseWithDetails } from "../actions/get-courses";

interface CourseCardProps {
  course: CourseWithDetails;
}

export function CourseCard({ course }: CourseCardProps) {
  const isEnrolled = course.isEnrolled;
  const initial = (course.instructor.name ?? "D")[0]?.toUpperCase() ?? "D";

  return (
    <div className="group relative flex flex-col justify-between border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] transition-all duration-200 hover:border-[#026BCA] dark:hover:border-[#00BCE4] hover:shadow-md">
      {/* Top Banner / Image (Square & Crisp) */}
      <div className="relative h-40 w-full overflow-hidden bg-[#00155C] border-b border-slate-200 dark:border-slate-800">
        {course.imageUrl ? (
          <>
            <img
              src={course.imageUrl}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00155C]/90 via-[#00155C]/30 to-transparent" />
          </>
        ) : (
          <div className="relative h-full w-full bg-gradient-to-br from-[#00155C] via-[#002147] to-[#0A1A3A] p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="flex h-7 w-7 items-center justify-center border border-white/20 bg-white/10 text-white">
                <BookOpenIcon size={14} />
              </span>
            </div>
          </div>
        )}

        {/* Status Tag: Matriculado / Disponible */}
        <div className="absolute top-2.5 left-2.5">
          {isEnrolled ? (
            <span className="inline-flex items-center gap-1 border border-emerald-400/40 bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 bg-emerald-400 animate-pulse" />
              Matriculado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 border border-cyan-400/30 bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 backdrop-blur-sm">
              Disponible
            </span>
          )}
        </div>

        {/* Enrollment Count */}
        <div className="absolute top-2.5 right-2.5 border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-slate-200 backdrop-blur-sm">
          {course._count.enrollments} alumnos
        </div>

        {/* Category Area Badge */}
        {course.area && (
          <div className="absolute bottom-2.5 left-2.5 border border-white/20 bg-[#00155C]/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#00BCE4] backdrop-blur-sm">
            {course.area}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Header Metadata */}
          <div className="flex items-center justify-between gap-2 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">
            <span>{course.modality === "live" ? "Virtual en Vivo" : "Asíncrono"}</span>
            {course._count.sections > 0 && (
              <span className="flex items-center gap-1">
                <LayersIcon size={11} /> {course._count.sections} módulos
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mt-2 text-sm sm:text-base font-bold text-[#00155C] dark:text-white group-hover:text-[#026BCA] dark:group-hover:text-[#00BCE4] transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          {/* Description */}
          {course.description && (
            <p className="mt-2 line-clamp-2 text-xs text-slate-700 dark:text-slate-400 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        {/* Footer & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            {/* Instructor */}
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center bg-[#00155C] dark:bg-[#026BCA] text-[10px] font-bold text-white">
                {initial}
              </div>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                {course.instructor.name ?? "Docente Cognos"}
              </span>
            </div>

            {/* Level */}
            {course.level && (
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5">
                {course.level}
              </span>
            )}
          </div>

          {/* Primary Action Button */}
          <Link
            href={`/dashboard/courses/${course.id}`}
            className={`flex w-full items-center justify-center gap-2 py-2 px-3 text-xs font-bold transition-colors ${
              isEnrolled
                ? "bg-[#00155C] text-white hover:bg-[#026BCA] dark:bg-[#026BCA] dark:hover:bg-[#00BCE4] dark:hover:text-[#00155C]"
                : "border border-[#00155C] text-[#00155C] hover:bg-[#00155C] hover:text-white dark:border-[#00BCE4] dark:text-[#00BCE4] dark:hover:bg-[#00BCE4] dark:hover:text-[#00155C]"
            }`}
          >
            <span>{isEnrolled ? "Ingresar al Aula Virtual" : "Ver Programa e Inscribirme"}</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
