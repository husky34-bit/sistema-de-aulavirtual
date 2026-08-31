import { requireAuth } from "@/lib/auth-helpers";
import { getAssignmentById } from "@/features/assignments/actions/get-assignment-by-id";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SubmissionForm } from "@/features/assignments/components/submission-form";
import { GradingPanel } from "@/features/assignments/components/grading-panel";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string; assignId: string }>;
}) {
  const user = await requireAuth();
  const { id: courseId, assignId } = await params;

  const result = await getAssignmentById(assignId);
  if (!result.success) notFound();
  const a = result.data;

  const isStaff = a.canEdit;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Volver al curso
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{a.title}</h1>
        {a.description && <p className="mt-1 text-slate-600">{a.description}</p>}
        <p className="mt-1 text-sm text-slate-500">
          Máx {a.maxScore} pts
          {a.dueAt && ` · Vence ${new Date(a.dueAt).toLocaleString()}`}
          {a.section && ` · Sección: ${a.section.title}`}
        </p>
      </div>

      {a.instructions && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Instrucciones</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{a.instructions}</p>
        </div>
      )}

      {isStaff ? (
        <div className="space-y-3">
          <Link
            href={`/dashboard/courses/${courseId}/assign/${assignId}/submissions`}
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Ver entregas
          </Link>
        </div>
      ) : (
        <SubmissionForm
          assignmentId={assignId}
          allowOnlineText={a.allowOnlineText}
          allowFiles={a.allowFiles}
          initialText={a.mySubmission?.onlineText ?? null}
          initialStatus={a.mySubmission?.status ?? null}
          initialFeedback={a.mySubmission?.feedback ?? null}
          initialScore={a.mySubmission?.score ?? null}
          maxScore={a.maxScore}
          isLate={a.mySubmission?.isLate ?? false}
        />
      )}

      {isStaff && a.mySubmission && (
        <GradingPanel
          submissionId={a.mySubmission.id}
          assignmentId={assignId}
          userId={user.id}
          userName="Vista previa (tu propio envío)"
          userEmail=""
          maxScore={a.maxScore}
          initialScore={a.mySubmission.score}
          initialFeedback={a.mySubmission.feedback}
          submittedAt={a.mySubmission.submittedAt}
          isLate={a.mySubmission.isLate}
          onlineText={a.mySubmission.onlineText}
        />
      )}
    </div>
  );
}
