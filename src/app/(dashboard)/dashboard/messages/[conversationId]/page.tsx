import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ConversationList } from "@/features/messaging/components/conversation-list";
import { MessageThread } from "@/features/messaging/components/message-thread";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const user = await requireAuth();
  const { conversationId } = await params;

  // Verificar acceso
  const membership = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
    select: { id: true, conversation: { select: { course: { select: { title: true } } } }, },
  });
  if (!membership) notFound();

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <ConversationList activeConversationId={conversationId} />
      </div>
      <div className="md:col-span-2">
        <div className="rounded-xl border border-slate-200 bg-white">
          {membership.conversation.course?.title && (
            <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-[#026BCA]">
              Curso: {membership.conversation.course.title}
            </div>
          )}
          <MessageThread conversationId={conversationId} currentUserId={user.id} />
        </div>
      </div>
    </div>
  );
}
