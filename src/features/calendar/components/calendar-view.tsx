'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { getEvents, createEvent, deleteEvent } from '../actions/calendar-actions';

interface CalendarEventData {
  id: string;
  title: string;
  startsAt: string;
  type: string;
  userId: string | null;
}

// Vista mensual simple (grid CSS de días), sin librería pesada.
export function CalendarView({ currentUserId }: { currentUserId: string }) {
  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '' });
  const [, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await getEvents();
      if (res.success) {
        setEvents(res.data.map((e) => ({
          id: e.id,
          title: e.title,
          startsAt: e.startsAt.toISOString(),
          type: e.type,
          userId: e.userId,
        })));
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  function eventsForDay(day: number) {
    return events.filter((e) => {
      const d = new Date(e.startsAt);
      return d.getFullYear() === currentMonth.getFullYear() &&
        d.getMonth() === currentMonth.getMonth() &&
        d.getDate() === day;
    });
  }

  function handleAdd() {
    if (!newEvent.title.trim() || !newEvent.date) return;
    startTransition(async () => {
      await createEvent({
        title: newEvent.title,
        startsAt: new Date(newEvent.date).toISOString(),
      });
      setNewEvent({ title: '', date: '' });
      setShowAdd(false);
      load();
    });
  }

  const typeColor: Record<string, string> = {
    manual: 'bg-blue-100 text-blue-700',
    quiz_open: 'bg-emerald-100 text-emerald-700',
    quiz_close: 'bg-red-100 text-red-700',
    assign_due: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {currentMonth.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Hoy
          </button>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            →
          </button>
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Evento
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="flex gap-2 rounded-lg border border-slate-200 bg-white p-4">
          <input
            type="text"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            placeholder="Título del evento"
            className="flex-1 rounded-lg border border-slate-300 p-2 text-sm"
          />
          <input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            className="rounded-lg border border-slate-300 p-2 text-sm"
          />
          <button onClick={handleAdd} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Añadir
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
            <div key={d} className="p-2 text-center text-xs font-medium text-slate-500">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => (
            <div
              key={idx}
              className="min-h-24 border-b border-r border-slate-100 p-1.5"
            >
              {day && (
                <>
                  <span className="text-xs font-medium text-slate-600">{day}</span>
                  <div className="mt-1 space-y-0.5">
                    {eventsForDay(day).map((e) => (
                      <div
                        key={e.id}
                        className={`group flex items-center justify-between rounded px-1.5 py-0.5 text-xs ${typeColor[e.type] ?? 'bg-slate-100 text-slate-700'}`}
                      >
                        <span className="truncate">{e.title}</span>
                        {e.type === 'manual' && e.userId === currentUserId && (
                          <button
                            onClick={() => startTransition(async () => { await deleteEvent(e.id); load(); })}
                            className="ml-1 hidden text-red-500 group-hover:inline"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
