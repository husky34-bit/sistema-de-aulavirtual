import { requireAuth } from "@/lib/auth-helpers";
import { getNotifications, markAllRead } from "@/features/notifications/actions/notification-actions";

export default async function NotificationsPage() {
  await requireAuth();
  const result = await getNotifications();
  const notifications = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Notificaciones</h1>
        {notifications.some((n) => !n.readAt) && (
          <form action={async () => { 'use server'; await markAllRead(); }}>
            <button type="submit" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Marcar todas como leídas
            </button>
          </form>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No tienes notificaciones.
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-lg border p-4 ${n.readAt ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">{n.title}</p>
                  {n.body && <p className="mt-1 text-sm text-slate-600">{n.body}</p>}
                  {n.link && (
                    <a href={n.link} className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                      Ver más →
                    </a>
                  )}
                </div>
                <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
