import { requireRole } from "@/lib/auth-helpers";
import { CreateCourseClientForm } from "@/features/courses/components/create-course-client-form";
import { BookOpenIcon } from "@/components/Icons";

export const metadata = {
  title: "Crear Nuevo Curso",
};

export default async function NewCoursePage() {
  await requireRole(["ADMIN", "TEACHER", "MANAGER"]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 font-poppins">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#026BCA] to-[#00155C] text-white shadow-md shadow-[#00155C]/20">
          <BookOpenIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#00155C]">Crear Nuevo Curso</h1>
          <p className="text-xs text-slate-500">
            Define el programa, portada representativa, secciones y actividades para tus estudiantes.
          </p>
        </div>
      </div>

      <CreateCourseClientForm />
    </div>
  );
}
