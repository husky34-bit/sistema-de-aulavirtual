import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GroupManager } from "@/features/groups/components/group-manager";

export default async function GroupsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["ADMIN", "TEACHER", "MANAGER"]);
  const { id: courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, instructorId: true },
  });
  if (!course) notFound();
  if (course.instructorId !== user.id && user.role !== "ADMIN") notFound();

  return (
    <div className="space-y-6">
      <Link href={`/dashboard/courses/${courseId}`} className="text-sm text-slate-500 hover:text-slate-900">
        ← Volver al curso
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">Grupos de {course.title}</h1>
      <GroupManager courseId={courseId} />
    </div>
  );
}
