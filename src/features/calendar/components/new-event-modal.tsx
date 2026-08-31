'use client';

import { useState, useEffect } from 'react';
import { createEvent, getUserCalendarCourses } from '../actions/calendar-actions';
import { CalendarIcon } from '@/components/Icons';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
  defaultDate?: Date;
}

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export function NewEventModal({
  isOpen,
  onClose,
  onEventCreated,
  defaultDate = new Date(),
}: NewEventModalProps) {
  const [title, setTitle] = useState('');
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // Start Date state
  const [startDay, setStartDay] = useState(defaultDate.getDate());
  const [startMonth, setStartMonth] = useState(defaultDate.getMonth());
  const [startYear, setStartYear] = useState(defaultDate.getFullYear());
  const [startHour, setStartHour] = useState(defaultDate.getHours());
  const [startMinute, setStartMinute] = useState(defaultDate.getMinutes());

  // Toggle "Ver más... / Ver menos..."
  const [showAdvanced, setShowAdvanced] = useState(true);

  // Description & Location
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // Duration Type: 'none' | 'until' | 'minutes'
  const [durationType, setDurationType] = useState<'none' | 'until' | 'minutes'>('none');
  const [untilDay, setUntilDay] = useState(defaultDate.getDate());
  const [untilMonth, setUntilMonth] = useState(defaultDate.getMonth());
  const [untilYear, setUntilYear] = useState(defaultDate.getFullYear());
  const [untilHour, setUntilHour] = useState(defaultDate.getHours() + 1 > 23 ? 23 : defaultDate.getHours() + 1);
  const [untilMinute, setUntilMinute] = useState(defaultDate.getMinutes());
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Repetition
  const [repeatEvent, setRepeatEvent] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getUserCalendarCourses().then((data) => setCourses(data));
      const d = defaultDate || new Date();
      setStartDay(d.getDate());
      setStartMonth(d.getMonth());
      setStartYear(d.getFullYear());
      setStartHour(d.getHours());
      setStartMinute(d.getMinutes());
      setUntilDay(d.getDate());
      setUntilMonth(d.getMonth());
      setUntilYear(d.getFullYear());
      setUntilHour(d.getHours() + 1 > 23 ? 23 : d.getHours() + 1);
      setUntilMinute(d.getMinutes());
      setTitle('');
      setDescription('');
      setLocation('');
      setRepeatEvent(false);
      setRepeatWeeks(1);
      setDurationType('none');
      setError(null);
    }
  }, [isOpen, defaultDate]);

  if (!isOpen) return null;

  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título del evento es obligatorio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startDate = new Date(startYear, startMonth, startDay, startHour, startMinute, 0);
      let endDate: Date | null = null;

      if (durationType === 'until') {
        endDate = new Date(untilYear, untilMonth, untilDay, untilHour, untilMinute, 0);
      } else if (durationType === 'minutes') {
        endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
      }

      const res = await createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        startsAt: startDate.toISOString(),
        endsAt: endDate ? endDate.toISOString() : null,
        courseId: selectedCourseId || null,
        repeatWeeks: repeatEvent ? repeatWeeks : 1,
      });

      if (!res.success) {
        const errorMsg =
          'errors' in res && res.errors
            ? Object.values(res.errors).flat().join(', ')
            : 'Error al guardar el evento';
        setError(errorMsg || 'Error al guardar el evento');
        return;
      }

      onEventCreated();
      onClose();
    } catch {
      setError('Ocurrió un error inesperado al guardar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#101D31] shadow-2xl text-slate-800 dark:text-slate-200 my-8">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            Nuevo evento
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="border border-red-300 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Título del Evento */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              Título del evento
              <span className="text-red-500 text-sm font-bold" title="Requerido">●</span>
            </label>
            <div className="sm:col-span-3">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Clase en vivo, Entrega de proyecto, Examen final"
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#00155C] dark:focus:border-[#00BCE4]"
              />
            </div>
          </div>

          {/* Fecha de Inicio */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Fecha
            </label>
            <div className="sm:col-span-3 flex flex-wrap items-center gap-1.5 text-xs">
              {/* Día */}
              <select
                value={startDay}
                onChange={(e) => setStartDay(Number(e.target.value))}
                className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 outline-none text-xs"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Mes */}
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(Number(e.target.value))}
                className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 outline-none text-xs capitalize"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              {/* Año */}
              <select
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 outline-none text-xs"
              >
                {[2025, 2026, 2027, 2028, 2029].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Hora */}
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 outline-none text-xs"
              >
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                ))}
              </select>

              <span>:</span>

              {/* Minuto */}
              <select
                value={startMinute}
                onChange={(e) => setStartMinute(Number(e.target.value))}
                className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 outline-none text-xs"
              >
                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                ))}
              </select>

              <span className="text-amber-600 dark:text-amber-400 ml-1">
                <CalendarIcon size={14} />
              </span>
            </div>
          </div>

          {/* Toggle Ver más / Ver menos */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              {showAdvanced ? 'Ver menos...' : 'Ver más...'}
            </button>
          </div>

          {showAdvanced && (
            <>
              {/* Tipo de Evento / Curso */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tipo de evento
                </label>
                <div className="sm:col-span-3">
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">Evento de usuario (Personal)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        Curso: {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descripción con Barra de Herramientas Estilo Editor */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                  Descripción
                </label>
                <div className="sm:col-span-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                  {/* Barra de menú superior */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="hover:text-black cursor-pointer">Editar</span>
                    <span className="hover:text-black cursor-pointer">Ver</span>
                    <span className="hover:text-black cursor-pointer">Insertar</span>
                    <span className="hover:text-black cursor-pointer">Formato</span>
                    <span className="hover:text-black cursor-pointer">Herramientas</span>
                    <span className="hover:text-black cursor-pointer">Tabla</span>
                    <span className="hover:text-black cursor-pointer">Ayuda</span>
                  </div>

                  {/* Iconos de formato */}
                  <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <button type="button" className="font-bold hover:text-[#00155C]" title="Negrita" onClick={() => setDescription((d) => d + ' **texto**')}>
                      B
                    </button>
                    <button type="button" className="italic hover:text-[#00155C]" title="Cursiva" onClick={() => setDescription((d) => d + ' *texto*')}>
                      I
                    </button>
                    <span className="text-slate-300">|</span>
                    <button type="button" title="Insertar Enlace" onClick={() => setDescription((d) => d + ' [enlace](url)')}>
                      🔗
                    </button>
                    <button type="button" title="Lista" onClick={() => setDescription((d) => d + '\n- ')}>
                      •≡
                    </button>
                    <button type="button" title="Audio / Micrófono">
                      🎤
                    </button>
                    <button type="button" title="Video">
                      📹
                    </button>
                  </div>

                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles del evento, temario, instrucciones o enlace de reunión..."
                    className="w-full p-3 text-xs bg-transparent outline-none resize-y text-slate-800 dark:text-slate-200"
                  />

                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 px-3 py-1 text-[10px] text-slate-400">
                    <span>p</span>
                    <span>{wordCount} palabras · tiny</span>
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ubicación
                </label>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej. Sala Zoom 1, Sede Central Aula 302, Google Meet"
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#00155C]"
                  />
                </div>
              </div>

              {/* Duración */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                  Duración
                </label>
                <div className="sm:col-span-3 space-y-2.5 text-xs">
                  {/* Opción 1: Sin duración */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="durationType"
                      checked={durationType === 'none'}
                      onChange={() => setDurationType('none')}
                    />
                    <span>Sin duración</span>
                  </label>

                  {/* Opción 2: Hasta */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="durationType"
                        checked={durationType === 'until'}
                        onChange={() => setDurationType('until')}
                      />
                      <span>Hasta</span>
                    </label>

                    {durationType === 'until' && (
                      <div className="ml-5 flex flex-wrap items-center gap-1.5 pt-1">
                        <select
                          value={untilDay}
                          onChange={(e) => setUntilDay(Number(e.target.value))}
                          className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 outline-none text-xs"
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <select
                          value={untilMonth}
                          onChange={(e) => setUntilMonth(Number(e.target.value))}
                          className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 outline-none text-xs capitalize"
                        >
                          {MONTHS.map((m, idx) => (
                            <option key={m} value={idx}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={untilYear}
                          onChange={(e) => setUntilYear(Number(e.target.value))}
                          className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 outline-none text-xs"
                        >
                          {[2025, 2026, 2027, 2028, 2029].map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                        <select
                          value={untilHour}
                          onChange={(e) => setUntilHour(Number(e.target.value))}
                          className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 outline-none text-xs"
                        >
                          {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                            <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                          ))}
                        </select>
                        <span>:</span>
                        <select
                          value={untilMinute}
                          onChange={(e) => setUntilMinute(Number(e.target.value))}
                          className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 outline-none text-xs"
                        >
                          {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                            <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                          ))}
                        </select>
                        <span className="text-amber-600 dark:text-amber-400">
                          <CalendarIcon size={14} />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Opción 3: Duración en minutos */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="durationType"
                        checked={durationType === 'minutes'}
                        onChange={() => setDurationType('minutes')}
                      />
                      <span>Duración en minutos</span>
                    </label>

                    {durationType === 'minutes' && (
                      <div className="ml-5 pt-1">
                        <input
                          type="number"
                          min={1}
                          max={1440}
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(Number(e.target.value))}
                          className="w-24 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs outline-none"
                        />
                        <span className="ml-2 text-xs text-slate-500">minutos</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Repetición Semanal */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <div className="sm:col-start-2 sm:col-span-3 space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={repeatEvent}
                      onChange={(e) => setRepeatEvent(e.target.checked)}
                      className="rounded-none"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Repetir este evento
                    </span>
                  </label>

                  {repeatEvent && (
                    <div className="pt-1">
                      <label className="block text-[11px] text-slate-500 mb-1">
                        Número de eventos similares repetidos semanalmente
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={52}
                        value={repeatWeeks}
                        onChange={(e) => setRepeatWeeks(Number(e.target.value))}
                        className="w-24 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Footer del Formulario */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-red-500 font-bold">●</span>
              <span>Requerido</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="border border-[#00155C] bg-[#00155C] px-6 py-2 text-xs font-bold text-white hover:bg-[#026BCA] transition disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
