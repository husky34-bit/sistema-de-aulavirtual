import { getCourses } from "@/features/courses/actions/get-courses";
import { CourseCard } from "@/features/courses/components/course-card";
import { requireAuth } from "@/lib/auth-helpers";
import Link from "next/link";
import { BookOpenIcon } from "@/components/Icons";

export default async function CoursesPage() {
  const user = await requireAuth();
  const { data: courses } = await getCourses();
  const canCreate = ["ADMIN", "TEACHER", "MANAGER"].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            <BookOpenIcon size={14} className="shrink-0" /> Catálogo Académico
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Cursos Disponibles
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Explora todos los programas académicos y cursos activos de la institución
          </p>
        </div>

        {canCreate && (
          <Link
            href="/dashboard/courses/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:from-blue-600 hover:to-indigo-600 active:scale-95"
          >
            <span>+ Crear nuevo curso</span>
          </Link>
        )}
      </div>

      {!courses || courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <BookOpenIcon size={28} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">No hay cursos registrados</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Sé el primero en publicar un curso para comenzar a impartir clases.
          </p>
          {canCreate && (
            <Link
              href="/dashboard/courses/new"
              className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Crear el primer curso
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

