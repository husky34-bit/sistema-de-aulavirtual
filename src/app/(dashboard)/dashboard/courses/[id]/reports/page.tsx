import { requireRole } from "@/lib/auth-helpers";
import { courseOverviewReport, activityCompletionReport } from "@/features/reports/actions/report-actions";
import { CourseReportView } from "@/features/reports/components/report-view";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN", "TEACHER", "MANAGER"]);
  const { id: courseId } = await params;

  const overview = await courseOverviewReport(courseId);
  const completion = await activityCompletionReport(courseId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Reportes del curso</h1>
      <CourseReportView
        courseId={courseId}
        overview={overview.success ? overview.data : null}
        completion={completion.success ? completion.data : null}
      />
    </div>
  );
}
