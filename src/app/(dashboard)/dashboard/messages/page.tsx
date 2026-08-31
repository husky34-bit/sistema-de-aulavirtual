import { requireAuth } from "@/lib/auth-helpers";
import { ConversationList } from "@/features/messaging/components/conversation-list";
import { MessagePreferences } from "@/features/messaging/components/message-preferences";
import { getMessagePreferences } from "@/features/messaging/actions/messaging-policy-actions";

export default async function MessagesPage() {
  const user = await requireAuth();
  const preferences = await getMessagePreferences();
  void user;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mensajes</h1>
          <p className="mt-1 text-sm text-slate-500">Para iniciar una conversación, abre un curso y entra en Participantes.</p>
        </div>
        <ConversationList />
      </div>
      <MessagePreferences privacy={preferences.privacy} requests={preferences.requests} />
    </div>
  );
}
