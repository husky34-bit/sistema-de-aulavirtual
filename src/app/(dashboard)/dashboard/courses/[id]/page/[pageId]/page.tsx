import { requireAuth } from "@/lib/auth-helpers";
import { getPage } from "@/features/pages/actions/get-page";
import { markComplete } from "@/features/completion/services/completion-engine";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileTextIcon } from "@/components/Icons";

export default async function ContentPageView({
  params,
}: {
  params: Promise<{ id: string; pageId: string }>;
}) {
  const user = await requireAuth();
  const { id: courseId, pageId } = await params;

  const result = await getPage(pageId);
  if (!result.success) notFound();
  const p = result.data;

  // Marcar como completado al visualizar
  await markComplete({ userId: user.id, activityType: 'page', activityId: pageId, courseId });

  return (
    <div className="space-y-4">
      <Link href={`/dashboard/courses/${courseId}`} className="text-sm text-slate-500 hover:text-slate-900">
        ← Volver al curso
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><FileTextIcon size={24} className="text-[#026BCA] shrink-0" /> {p.title}</h1>
      <div
        className="prose prose-slate max-w-none rounded-xl border border-slate-200 bg-white p-6"
        dangerouslySetInnerHTML={{ __html: p.content }}
      />
    </div>
  );
}
