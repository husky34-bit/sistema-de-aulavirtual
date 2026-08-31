import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CreateAssignmentForm } from "@/features/assignments/components/create-assignment-form";

export default async function NewAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["ADMIN", "TEACHER", "MANAGER"]);
  const { id: courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, instructorId: true, sections: { select: { id: true, title: true }, orderBy: { position: "asc" } } },
  });
  if (!course) notFound();
  if (course.instructorId !== user.id && user.role !== "ADMIN") notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nueva tarea</h1>
        <p className="text-sm text-slate-500">{course.title}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <CreateAssignmentForm courseId={courseId} sections={course.sections} />
      </div>
    </div>
  );
}
