import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NewDiscussionForm } from "@/features/forums/components/new-discussion-form";

export default async function NewDiscussionPage({
  params,
}: {
  params: Promise<{ id: string; forumId: string }>;
}) {
  await requireAuth();
  const { id: courseId, forumId } = await params;

  const forum = await prisma.forum.findUnique({ where: { id: forumId } });
  if (!forum) notFound();

  return (
    <div className="space-y-4">
      <Link href={`/dashboard/courses/${courseId}/forum/${forumId}`} className="text-sm text-slate-500 hover:text-slate-900">
        ← Volver al foro
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">Nueva discusión en {forum.title}</h1>
      <NewDiscussionForm forumId={forumId} courseId={courseId} />
    </div>
  );
}
