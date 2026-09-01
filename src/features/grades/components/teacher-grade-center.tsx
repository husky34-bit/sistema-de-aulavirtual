'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTeacherGradebookOverview } from '../actions/get-teacher-grades';
import { GraderReport } from './grader-report';
import { UserReport } from './user-report';
import {
  BookOpenIcon,
  UsersIcon,
  BarChartIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@/components/Icons';

interface TeacherCourse {
  id: string;
  title: string;
  code?: string | null;
  area?: string | null;
  instructorName?: string | null;
  studentsCount: number;
  assignmentsCount: number;
  quizzesCount: number;
  pendingCount: number;
}

export function TeacherGradeCenter({ hasEnrollments = false }: { hasEnrollments?: boolean }) {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherGradebookOverview().then((res) => {
      if (res.success) {
        setCourses(res.courses);
        if (res.courses.length > 0 && !selectedCourseId) {
          setSelectedCourseId(res.courses[0].id);
        }
      }
      setLoading(false);
    });
  }, [selectedCourseId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
        Cargando libros de calificaciones...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-poppins">
      {/* Switcher de Vista si el docente también es alumno */}
      {hasEnrollments && (
        <div className="inline-flex border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className={`px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'teacher'
                ? 'bg-[#00155C] text-white shadow-xs dark:bg-[#026BCA]'
                : 'text-slate-600 hover:text-[#00155C] dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            👨‍🏫 Gestión de Calificaciones (Docente)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'student'
                ? 'bg-[#00155C] text-white shadow-xs dark:bg-[#026BCA]'
                : 'text-slate-600 hover:text-[#00155C] dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            🎓 Mis Notas Personales (Alumno)
          </button>
        </div>
      )}

      {activeTab === 'student' ? (
        <UserReport />
      ) : (
        <div className="space-y-6">
          {/* Cursos que enseña el docente */}
          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#00155C]">
                <BookOpenIcon size={24} />
              </div>
              <p className="mt-3 font-semibold text-slate-700">No tienes cursos asignados como docente</p>
              <p className="mt-1 text-xs text-slate-400">
                Cuando tengas cursos a tu cargo, aquí podrás administrar las notas de tus alumnos y exportar actas.
              </p>
            </div>
          ) : (
            <>
              {/* Tarjetas resumen de cursos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((c) => {
                  const isSelected = selectedCourseId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCourseId(c.id)}
                      className={`cursor-pointer rounded-xl border p-5 transition-all ${
                        isSelected
                          ? 'border-[#026BCA] bg-[#EDF6FF]/40 shadow-sm dark:border-[#00BCE4] dark:bg-blue-950/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#101D31]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#026BCA] dark:text-[#00BCE4]">
                          {c.area || 'Curso'}
                        </span>
                        {c.pendingCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            <ClockIcon size={10} />
                            {c.pendingCount} por calificar
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircleIcon size={10} />
                            Al día
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 text-sm font-bold text-[#00155C] dark:text-white line-clamp-2">
                        {c.title}
                      </h3>

                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1">
                          <UsersIcon size={13} /> {c.studentsCount} alumnos
                        </span>
                        <span>
                          {c.assignmentsCount} tareas · {c.quizzesCount} quizzes
                        </span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          className={`flex-1 py-1.5 text-xs font-bold text-center border transition ${
                            isSelected
                              ? 'border-[#00155C] bg-[#00155C] text-white dark:border-[#00BCE4] dark:bg-[#00BCE4] dark:text-[#00155C]'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ Viendo Calificador' : 'Seleccionar Curso'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Libro de Calificaciones del curso seleccionado */}
              {selectedCourseId && (
                <div className="border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#101D31]">
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#026BCA]">
                        Libro del Calificador
                      </span>
                      <h2 className="text-base font-bold text-[#00155C] dark:text-white">
                        {courses.find((c) => c.id === selectedCourseId)?.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/courses/${selectedCourseId}`}
                        className="border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Ir al Aula del Curso →
                      </Link>
                    </div>
                  </div>

                  <GraderReport courseId={selectedCourseId} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
