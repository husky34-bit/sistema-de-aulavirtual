import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PostThread } from "@/features/forums/components/post-thread";
import { getPosts } from "@/features/forums/actions/forum-actions";

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ id: string; forumId: string; discussionId: string }>;
}) {
  const user = await requireAuth();
  const { id: courseId, forumId, discussionId } = await params;

  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: { forum: { include: { course: { select: { instructorId: true } } } } },
  });
  if (!discussion) notFound();

  const isStaff = discussion.forum.course.instructorId === user.id || user.role === "ADMIN";

  const result = await getPosts(discussionId);
  const posts = result.success ? result.data : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <Link href={`/dashboard/courses/${courseId}/forum/${forumId}`} className="text-slate-500 hover:text-slate-900">
          ← Foro
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">{discussion.title}</h1>
      {discussion.locked && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          Esta discusión está cerrada. No se pueden añadir más respuestas.
        </p>
      )}
      <PostThread
        posts={posts.map((p) => ({
          id: p.id,
          authorId: p.authorId,
          authorName: p.author.name ?? "Anónimo",
          content: p.content,
          createdAt: p.createdAt.toISOString(),
          editedAt: p.editedAt?.toISOString() ?? null,
          parentId: p.parentId,
        }))}
        discussionId={discussionId}
        currentUserId={user.id}
        isStaff={isStaff}
        locked={discussion.locked}
        isQnaHidden={result.success ? result.isQnaHidden : false}
      />
    </div>
  );
}
