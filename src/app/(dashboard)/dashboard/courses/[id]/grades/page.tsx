import { requireRole } from "@/lib/auth-helpers";
import { GraderReport } from "@/features/grades/components/grader-report";

export default async function GradebookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN", "TEACHER", "MANAGER"]);
  const { id: courseId } = await params;

  return (
    <div className="space-y-6">
      <GraderReport courseId={courseId} />
    </div>
  );
}
