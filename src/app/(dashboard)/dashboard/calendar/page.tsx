import { requireAuth } from "@/lib/auth-helpers";
import { CalendarView } from "@/features/calendar/components/calendar-view";

export default async function CalendarPage() {
  const user = await requireAuth();
  return <CalendarView currentUserId={user.id} />;
}
