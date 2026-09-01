"use client";

import { useState, useMemo } from "react";
import { CourseCard } from "./course-card";
import type { CourseWithDetails } from "../actions/get-courses";
import {
  BookOpenIcon,
  SearchIcon,
  FilterIcon,
  CheckCircleIcon,
  GraduationCapIcon,
  LayersIcon,
} from "@/components/Icons";
import Link from "next/link";

interface CourseCatalogViewProps {
  initialCourses: CourseWithDetails[];
  canCreate: boolean;
}

type TabKey = "my-courses" | "available" | "all";

export function CourseCatalogView({ initialCourses, canCreate }: CourseCatalogViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("my-courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("all");

  // Separate list into enrolled vs available
  const enrolledCourses = useMemo(
    () => initialCourses.filter((c) => c.isEnrolled),
    [initialCourses]
  );
  const availableCourses = useMemo(
    () => initialCourses.filter((c) => !c.isEnrolled),
    [initialCourses]
  );

  // Extract unique areas
  const areas = useMemo(() => {
    const set = new Set<string>();
    initialCourses.forEach((c) => {
      if (c.area) set.add(c.area.toLowerCase());
    });
    return Array.from(set);
  }, [initialCourses]);

  // Current tab courses before search/area filter
  const baseCourses = useMemo(() => {
    if (activeTab === "my-courses") return enrolledCourses;
    if (activeTab === "available") return availableCourses;
    return initialCourses;
  }, [activeTab, enrolledCourses, availableCourses, initialCourses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return baseCourses.filter((course) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (course.instructor.name && course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesArea =
        selectedArea === "all" ||
        (course.area && course.area.toLowerCase() === selectedArea.toLowerCase());

      return matchesSearch && matchesArea;
    });
  }, [baseCourses, searchQuery, selectedArea]);

  return (
    <div className="space-y-6">
      {/* Top Header Controls (Minimalist & Square) */}
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#101D31] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00155C] dark:text-[#00BCE4]">
            <BookOpenIcon size={13} className="shrink-0" /> Plataforma de Cursos Cognos
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#00155C] dark:text-white sm:text-3xl">
            {activeTab === "my-courses"
              ? "Mis Cursos Matriculados"
              : activeTab === "available"
              ? "Cursos Disponibles"
              : "Catálogo Completo de Programas"}
          </h1>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-400 max-w-2xl">
            {activeTab === "my-courses"
              ? "Programas académicos en los que te encuentras activo. Accede al material, clases en vivo y evaluaciones."
              : activeTab === "available"
              ? "Explora nuevos cursos y programas de formación profesional disponibles para inscripción."
              : "Listado general de programas académicos y certificaciones de la institución."}
          </p>
        </div>

        {/* Action Button for Teachers / Admins */}
        {canCreate && (
          <Link
            href="/dashboard/courses/new"
            className="inline-flex items-center justify-center gap-2 border border-[#00155C] bg-[#00155C] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#026BCA] dark:border-[#00BCE4] dark:bg-[#00BCE4] dark:text-[#00155C] dark:hover:bg-white"
          >
            <span>+ Crear Nuevo Curso</span>
          </Link>
        )}
      </div>

      {/* Segmented Tab Switcher (Sharp / Minimalist) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-1">
          <button
            type="button"
            onClick={() => setActiveTab("my-courses")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "my-courses"
                ? "bg-[#00155C] text-white shadow-sm dark:bg-[#026BCA]"
                : "text-slate-600 hover:text-[#00155C] dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <GraduationCapIcon size={14} />
            <span>Mis Cursos</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "my-courses"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              {enrolledCourses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("available")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "available"
                ? "bg-[#00155C] text-white shadow-sm dark:bg-[#026BCA]"
                : "text-slate-600 hover:text-[#00155C] dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <BookOpenIcon size={14} />
            <span>Cursos Disponibles</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "available"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              {availableCourses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`hidden md:flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-[#00155C] text-white shadow-sm dark:bg-[#026BCA]"
                : "text-slate-600 hover:text-[#00155C] dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <LayersIcon size={14} />
            <span>Todos</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              {initialCourses.length}
            </span>
          </button>
        </div>

        {/* Metric Badge Summary */}
        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-400 font-semibold">
          <span>Mostrando:</span>
          <strong className="text-[#00155C] dark:text-white font-bold">
            {filteredCourses.length} {filteredCourses.length === 1 ? "curso" : "cursos"}
          </strong>
        </div>
      </div>

      {/* Filter & Search Bar (Square Minimalist) */}
      <div className="flex flex-col gap-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <SearchIcon size={15} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre de curso o docente..."
            className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#00155C] dark:focus:border-[#00BCE4]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category / Area Filter */}
        {areas.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              <FilterIcon size={12} /> Área:
            </span>
            <button
              type="button"
              onClick={() => setSelectedArea("all")}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                selectedArea === "all"
                  ? "border-[#00155C] bg-[#00155C] text-white dark:border-[#00BCE4] dark:bg-[#00BCE4] dark:text-[#00155C]"
                  : "border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-400 hover:border-slate-400"
              }`}
            >
              Todas
            </button>
            {areas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setSelectedArea(area)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap transition-colors ${
                  selectedArea === area
                    ? "border-[#00155C] bg-[#00155C] text-white dark:border-[#00BCE4] dark:bg-[#00BCE4] dark:text-[#00155C]"
                    : "border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-400 hover:border-slate-400"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#101D31] p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#00155C] dark:text-[#00BCE4]">
            <BookOpenIcon size={22} />
          </div>

          <h3 className="mt-4 text-base font-bold text-[#00155C] dark:text-white">
            {activeTab === "my-courses" && initialCourses.length > 0
              ? "No tienes cursos matriculados actualmente"
              : "No se encontraron cursos con los filtros seleccionados"}
          </h3>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {activeTab === "my-courses" && initialCourses.length > 0
              ? "Puedes revisar los cursos disponibles en el catálogo para inscribirte e iniciar tu capacitación."
              : "Prueba a cambiar el término de búsqueda o seleccionar otra categoría."}
          </p>

          <div className="mt-5 flex justify-center gap-3">
            {activeTab === "my-courses" && availableCourses.length > 0 ? (
              <button
                type="button"
                onClick={() => setActiveTab("available")}
                className="inline-flex items-center gap-2 border border-[#00155C] bg-[#00155C] px-4 py-2 text-xs font-bold text-white hover:bg-[#026BCA] dark:border-[#00BCE4] dark:bg-[#00BCE4] dark:text-[#00155C]"
              >
                Ver Cursos Disponibles ({availableCourses.length}) →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedArea("all");
                }}
                className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[2100px]:grid-cols-6 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
