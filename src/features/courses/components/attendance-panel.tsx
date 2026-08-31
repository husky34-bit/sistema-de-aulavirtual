"use client";

import { useState, useTransition } from "react";
import { createAttendanceSession, saveAttendance } from "@/features/courses/actions/attendance-actions";
import { CheckCircleIcon, PlusIcon, ClockIcon, UsersIcon } from "@/components/Icons";

interface AttendanceStudent {
  id: string;
  name: string | null;
  email: string;
  present: boolean;
}

interface AttendanceSessionData {
  id: string;
  title: string;
  date: Date;
  records: { userId: string; present: boolean }[];
}

interface AttendancePanelProps {
  courseId: string;
  sessions: AttendanceSessionData[];
  enrolledStudents: { id: string; name: string | null; email: string }[];
  canEdit: boolean;
  /** Solo para vista estudiante */
  currentUserId?: string;
}

function AttendanceBar({ percent }: { percent: number }) {
  const isGood = percent >= 80;
  const isWarning = percent >= 60 && percent < 80;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className={isGood ? "text-[#12AC81]" : isWarning ? "text-amber-600" : "text-red-600"}>
          Asistencia: {percent.toFixed(0)}%
        </span>
        <span className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 ${
          isGood
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
            : isWarning
            ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
            : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"
        }`}>
          {isGood ? "✓ Cumples el requisito (≥ 80%)" : isWarning ? "⚠ En riesgo — mejora tu asistencia" : "✗ No cumples el requisito"}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isGood ? "bg-gradient-to-r from-[#12AC81] to-[#00BCE4]" :
            isWarning ? "bg-gradient-to-r from-amber-400 to-amber-500" :
            "bg-gradient-to-r from-red-400 to-red-500"
          }`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function AttendancePanel({
  courseId,
  sessions,
  enrolledStudents,
  canEdit,
  currentUserId,
}: AttendancePanelProps) {
  const [sessionList, setSessionList] = useState(sessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Calcular % asistencia para el estudiante actual
  const studentAttendance = currentUserId
    ? sessionList.reduce(
        (acc, s) => {
          const rec = s.records.find((r) => r.userId === currentUserId);
          return { total: acc.total + 1, present: acc.present + (rec?.present ? 1 : 0) };
        },
        { total: 0, present: 0 }
      )
    : null;
  const attendancePct = studentAttendance && studentAttendance.total > 0
    ? (studentAttendance.present / studentAttendance.total) * 100
    : null;

  function openSession(s: AttendanceSessionData) {
    setActiveSessionId(s.id);
    const map: Record<string, boolean> = {};
    for (const stu of enrolledStudents) {
      const rec = s.records.find((r) => r.userId === stu.id);
      map[stu.id] = rec ? rec.present : false;
    }
    setAttendance(map);
  }

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createAttendanceSession({ courseId, title: newTitle, date: new Date(newDate) });
      if (res.success) {
        setSessionList((prev) => [...prev, { ...res.data, records: [] }]);
        setNewTitle(""); setShowNewForm(false);
      }
    });
  }

  async function handleSaveAttendance() {
    if (!activeSessionId) return;
    startTransition(async () => {
      const records = Object.entries(attendance).map(([userId, present]) => ({ userId, present }));
      const res = await saveAttendance({ sessionId: activeSessionId, records });
      if (res.success) {
        setSessionList((prev) =>
          prev.map((s) =>
            s.id === activeSessionId ? { ...s, records: records.map((r) => ({ ...r })) } : s
          )
        );
        setSavedMsg("Asistencia guardada correctamente ✓");
        setTimeout(() => setSavedMsg(null), 3000);
        setActiveSessionId(null);
      }
    });
  }

  const activeStudents: AttendanceStudent[] = enrolledStudents.map((s) => ({
    ...s,
    present: attendance[s.id] ?? false,
  }));

  return (
    <div className="space-y-6 font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[#00155C]">Control de Asistencia</h2>
          <p className="text-xs text-slate-500">Requisito mínimo: 80% para certificación Cognos</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowNewForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00155C] to-[#026BCA] px-4 py-2 text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <PlusIcon size={14} />
            Nueva sesión
          </button>
        )}
      </div>

      {/* Vista estudiante: barra de progreso */}
      {!canEdit && attendancePct !== null && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <AttendanceBar percent={attendancePct} />
          <p className="mt-2 text-[11px] text-slate-500">
            Asististe a {studentAttendance!.present} de {studentAttendance!.total} sesiones registradas.
          </p>
        </div>
      )}

      {/* Formulario nueva sesión */}
      {canEdit && showNewForm && (
        <form onSubmit={handleCreateSession} className="rounded-2xl border border-[#D0E5F7] dark:border-[#1e3a61] bg-[#F0F7FD] dark:bg-[#0f223d] p-5 space-y-3">
          <p className="text-xs font-bold text-[#00155C] uppercase tracking-wide">Registrar nueva sesión</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Título de la sesión</label>
              <input
                required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej: Sesión 4 — Módulo de Exploitation"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#101d31] px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#026BCA] focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha</label>
              <input
                type="date" required value={newDate} onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#101d31] px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:border-[#026BCA] focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending}
              className="rounded-xl bg-[#026BCA] px-5 py-2 text-xs font-bold text-white hover:bg-[#00155C] transition disabled:opacity-50">
              {isPending ? "Creando..." : "Crear sesión"}
            </button>
            <button type="button" onClick={() => setShowNewForm(false)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de sesiones */}
      {sessionList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF6FF] text-[#00155C]">
            <UsersIcon size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-[#00155C]">Sin sesiones registradas</h3>
          <p className="mt-1 text-xs text-slate-500">Las sesiones de clase aparecerán aquí para el control de asistencia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessionList.map((s) => {
            const total = enrolledStudents.length;
            const present = s.records.filter((r) => r.present).length;
            const pct = total > 0 ? Math.round((present / total) * 100) : 0;

            return (
              <div key={s.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between p-4 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDF6FF] text-[#00155C]">
                      <ClockIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#00155C] truncate">{s.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(s.date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {canEdit && s.records.length > 0 && (
                      <span className="text-xs font-bold text-[#12AC81]">
                        {present}/{total} presentes
                      </span>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => openSession(s)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#00155C] hover:border-[#026BCA] hover:text-[#026BCA] transition"
                      >
                        {s.records.length > 0 ? "Editar" : "Tomar lista"}
                      </button>
                    )}
                    {!canEdit && currentUserId && (
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        s.records.find((r) => r.userId === currentUserId)?.present
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"
                      }`}>
                        {s.records.find((r) => r.userId === currentUserId)?.present ? "✓ Presente" : "✗ Ausente"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra de asistencia para docente */}
                {canEdit && s.records.length > 0 && total > 0 && (
                  <div className="px-4 pb-4">
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#12AC81] to-[#00BCE4]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de toma de asistencia */}
      {activeSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between bg-[#00155C] px-6 py-4 text-white">
              <div>
                <h3 className="font-bold text-sm">Lista de Asistencia</h3>
                <p className="text-xs text-slate-300">{sessionList.find((s) => s.id === activeSessionId)?.title}</p>
              </div>
              <button onClick={() => setActiveSessionId(null)} className="rounded-lg p-1 text-slate-300 hover:bg-white/10 transition">✕</button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 px-6">
              {activeStudents.map((stu) => (
                <div key={stu.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EDF6FF] text-[#00155C] text-xs font-bold">
                      {(stu.name ?? stu.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{stu.name ?? stu.email}</p>
                      <p className="text-[11px] text-slate-400">{stu.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAttendance((prev) => ({ ...prev, [stu.id]: !prev[stu.id] }))}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      attendance[stu.id]
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {attendance[stu.id] ? <CheckCircleIcon size={13} /> : null}
                    {attendance[stu.id] ? "Presente" : "Ausente"}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
              {savedMsg ? (
                <span className="text-xs font-bold text-[#12AC81]">{savedMsg}</span>
              ) : (
                <span className="text-xs text-slate-500">
                  {activeStudents.filter((s) => attendance[s.id]).length} de {activeStudents.length} presentes
                </span>
              )}
              <div className="flex gap-2">
                <button onClick={() => setActiveSessionId(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">
                  Cancelar
                </button>
                <button onClick={handleSaveAttendance} disabled={isPending}
                  className="rounded-xl bg-[#00155C] px-5 py-2 text-xs font-bold text-white hover:bg-[#026BCA] transition disabled:opacity-50">
                  {isPending ? "Guardando..." : "Guardar asistencia"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
