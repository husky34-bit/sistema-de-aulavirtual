import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DiscussionList } from "@/features/forums/components/discussion-list";
import { MessageSquareIcon } from "@/components/Icons";

export default async function ForumPage({
  params,
}: {
  params: Promise<{ id: string; forumId: string }>;
}) {
  const user = await requireAuth();
  const { id: courseId, forumId } = await params;

  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
    include: { course: { select: { instructorId: true } } },
  });
  if (!forum) notFound();

  const isStaff = forum.course.instructorId === user.id || user.role === "ADMIN";

  const discussions = await prisma.discussion.findMany({
    where: { forumId },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { posts: true } },
    },
  });

  return (
    <div className="space-y-4">
      <Link href={`/dashboard/courses/${courseId}`} className="text-sm text-slate-500 hover:text-slate-900">
        ← Volver al curso
      </Link>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><MessageSquareIcon size={24} className="text-[#026BCA] shrink-0" /> {forum.title}</h1>
          {forum.description && <p className="mt-1 text-sm text-slate-500">{forum.description}</p>}
        </div>
        <Link
          href={`/dashboard/courses/${courseId}/forum/${forumId}/new`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nueva discusión
        </Link>
      </div>
      <DiscussionList
        courseId={courseId}
        forumId={forumId}
        discussions={discussions.map((d) => ({
          id: d.id,
          title: d.title,
          authorName: d.author.name ?? "Anónimo",
          postCount: d._count.posts,
          pinned: d.pinned,
          locked: d.locked,
          createdAt: d.createdAt.toISOString(),
        }))}
        isStaff={isStaff}
      />
    </div>
  );
}
