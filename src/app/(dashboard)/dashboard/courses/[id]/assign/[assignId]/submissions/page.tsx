import { requireRole } from "@/lib/auth-helpers";
import { getSubmissions } from "@/features/assignments/actions/get-submissions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GradingPanel } from "@/features/assignments/components/grading-panel";

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ id: string; assignId: string }>;
}) {
  await requireRole(["ADMIN", "TEACHER", "MANAGER"]);
  const { id: courseId, assignId } = await params;

  const result = await getSubmissions(assignId);
  if (!result.success) notFound();
  const { assignment, submissions } = result.data;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Volver al curso
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Entregas — {assignment.title}</h1>
        <p className="text-sm text-slate-500">
          Máx {assignment.maxScore} pts · {submissions.length} envío(s)
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Aún no hay entregas para esta tarea.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <GradingPanel
              key={s.id}
              submissionId={s.id}
              assignmentId={assignId}
              userId={s.userId}
              userName={s.userName ?? s.userEmail}
              userEmail={s.userEmail}
              maxScore={assignment.maxScore}
              initialScore={s.score}
              initialFeedback={s.feedback}
              submittedAt={s.submittedAt}
              isLate={s.isLate}
              onlineText={s.onlineText}
            />
          ))}
        </div>
      )}
    </div>
  );
}
