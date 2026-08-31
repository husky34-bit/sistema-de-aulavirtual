'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { getEvents, deleteEvent } from '../actions/calendar-actions';
import { NewEventModal } from './new-event-modal';
import { CalendarIcon, PlusIcon } from '@/components/Icons';

interface CalendarEventData {
  id: string;
  title: string;
  startsAt: string;
  endsAt?: string | null;
  type: string;
  userId: string | null;
  refId?: string | null;
}

export function CalendarView({ currentUserId }: { currentUserId: string }) {
  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);
  const [, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await getEvents();
      if (res.success) {
        setEvents(
          res.data.map((e) => ({
            id: e.id,
            title: e.title,
            startsAt: e.startsAt.toISOString(),
            endsAt: e.endsAt ? e.endsAt.toISOString() : null,
            type: e.type,
            userId: e.userId,
            refId: e.refId,
          }))
        );
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
      return (
        d.getFullYear() === currentMonth.getFullYear() &&
        d.getMonth() === currentMonth.getMonth() &&
        d.getDate() === day
      );
    });
  }

  function handleOpenModalForDay(day: number) {
    const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 9, 0, 0);
    setSelectedDate(targetDate);
    setIsModalOpen(true);
  }

  const typeColor: Record<string, string> = {
    manual: 'border-l-2 border-l-[#00155C] bg-[#EDF6FF] text-[#00155C] dark:bg-[#10233e] dark:text-cyan-300',
    quiz_open: 'border-l-2 border-l-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    quiz_close: 'border-l-2 border-l-red-500 bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300',
    assign_due: 'border-l-2 border-l-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  };

  const typeLabel: Record<string, string> = {
    manual: 'Evento',
    quiz_open: 'Apertura Quiz',
    quiz_close: 'Cierre Quiz',
    assign_due: 'Entrega Tarea',
  };

  return (
    <div className="space-y-6">
      {/* Header del Calendario (Minimalista & Cuadrado) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#101D31] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00155C] dark:text-[#00BCE4]">
            <CalendarIcon size={12} /> Calendario Académico
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#00155C] dark:text-white capitalize sm:text-3xl">
            {currentMonth.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Consulta tus clases programadas, fechas límite de entrega y evaluaciones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#101D31]">
            <button
              type="button"
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
              }
              className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-r border-slate-200 dark:border-slate-700"
              title="Mes anterior"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
              }}
              className="px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-r border-slate-200 dark:border-slate-700"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
              }
              className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Mes siguiente"
            >
              →
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedDate(new Date());
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 border border-[#00155C] bg-[#00155C] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#026BCA] transition dark:border-[#00BCE4] dark:bg-[#00BCE4] dark:text-[#00155C] dark:hover:bg-white"
          >
            <PlusIcon size={14} />
            <span>Nuevo Evento</span>
          </button>
        </div>
      </div>

      {/* Grid del Calendario Mensual */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] shadow-xs">
        {/* Cabecera de días de la semana */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((d) => (
            <div
              key={d}
              className="p-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Celdas de días */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, idx) => {
            const isToday =
              day !== null &&
              day === new Date().getDate() &&
              currentMonth.getMonth() === new Date().getMonth() &&
              currentMonth.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={idx}
                onClick={() => day && handleOpenModalForDay(day)}
                className={`min-h-28 border-b border-r border-slate-200 dark:border-slate-800/80 p-2 transition-colors ${
                  day
                    ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-850/50'
                    : 'bg-slate-50/40 dark:bg-slate-950/20'
                } ${isToday ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''}`}
              >
                {day && (
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isToday
                            ? 'bg-[#00155C] text-white px-1.5 py-0.2 dark:bg-[#026BCA]'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {day}
                      </span>
                      <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 font-bold">
                        +
                      </span>
                    </div>

                    <div className="mt-1.5 space-y-1 flex-1">
                      {eventsForDay(day).map((e) => (
                        <div
                          key={e.id}
                          onClick={(evt) => {
                            evt.stopPropagation();
                            setSelectedEvent(e);
                          }}
                          className={`group flex items-center justify-between px-2 py-1 text-[11px] font-semibold transition-all ${
                            typeColor[e.type] ?? 'border-l-2 border-l-slate-400 bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="truncate flex-1" title={e.title}>
                            {e.title}
                          </span>

                          {e.type === 'manual' && e.userId === currentUserId && (
                            <button
                              type="button"
                              onClick={(evt) => {
                                evt.stopPropagation();
                                startTransition(async () => {
                                  await deleteEvent(e.id);
                                  load();
                                });
                              }}
                              className="ml-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs font-bold px-1"
                              title="Eliminar evento"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Detalle de Evento */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#101D31] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#026BCA]">
                  {typeLabel[selectedEvent.type] ?? 'Evento'}
                </span>
                <h3 className="text-base font-bold text-[#00155C] dark:text-white">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <p>
                <strong>Fecha y hora:</strong> {new Date(selectedEvent.startsAt).toLocaleString()}
                {selectedEvent.endsAt && ` — ${new Date(selectedEvent.endsAt).toLocaleTimeString()}`}
              </p>
              {selectedEvent.refId && (
                <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3">
                  <p className="font-semibold text-slate-500 mb-1">Descripción / Notas:</p>
                  <p className="whitespace-pre-wrap">{selectedEvent.refId}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {selectedEvent.type === 'manual' && selectedEvent.userId === currentUserId && (
                <button
                  type="button"
                  onClick={() => {
                    startTransition(async () => {
                      if (selectedEvent) {
                        await deleteEvent(selectedEvent.id);
                        setSelectedEvent(null);
                        load();
                      }
                    });
                  }}
                  className="border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
                >
                  Eliminar Evento
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="border border-slate-300 dark:border-slate-700 px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Completo de Creación de Evento (Registro Amplio) */}
      <NewEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventCreated={load}
        defaultDate={selectedDate}
      />
    </div>
  );
}
