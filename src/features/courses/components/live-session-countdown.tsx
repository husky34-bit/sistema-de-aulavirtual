"use client";

import { useState, useEffect } from "react";
import { ClockIcon, CheckCircleIcon } from "@/components/Icons";

interface LiveSessionCountdownProps {
  liveUrl: string;
  schedule: string;
  /** Horario de la próxima sesión como string ISO ("2026-08-26T19:00:00") */
  nextSessionAt?: string;
  provider?: "zoom" | "meet" | "teams" | string;
}

function getProviderLabel(p?: string) {
  if (p === "zoom") return "Zoom";
  if (p === "meet") return "Google Meet";
  if (p === "teams") return "Microsoft Teams";
  return "Sala Virtual";
}

function getProviderColor(p?: string) {
  if (p === "meet") return "from-[#00A884] to-[#34A853]";
  if (p === "teams") return "from-[#5059C9] to-[#7B83EB]";
  return "from-[#00155C] to-[#026BCA]"; // zoom / default
}

function formatCountdown(ms: number) {
  if (ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const ACTIVE_WINDOW_MS = 15 * 60 * 1000; // 15 minutos antes

export function LiveSessionCountdown({
  liveUrl,
  schedule,
  nextSessionAt,
  provider,
}: LiveSessionCountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const nextMs = nextSessionAt ? new Date(nextSessionAt).getTime() : null;
  const msUntil = nextMs ? nextMs - now : null;
  const msAfter = nextMs ? now - nextMs : null;

  // Activo: desde -15 min hasta +3 h de la sesión
  const isActive =
    msUntil !== null &&
    msUntil <= ACTIVE_WINDOW_MS &&
    (msAfter === null || msAfter < 3 * 60 * 60 * 1000);

  const countdown = msUntil !== null && msUntil > 0 ? formatCountdown(msUntil) : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D0E5F7] dark:border-[#1e3a61] bg-gradient-to-r from-[#F0F7FD] via-[#E8F3FC] to-[#DCEEFB] dark:from-[#0b1b33] dark:via-[#0e2240] dark:to-[#102746] p-6 shadow-sm font-poppins">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {/* Indicador de estado */}
            <span className="relative flex h-3 w-3">
              {isActive ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex h-3 w-3 rounded-full bg-slate-300" />
              )}
            </span>
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isActive ? "text-emerald-700 dark:text-emerald-300" : "text-[#026BCA] dark:text-[#00BCE4]"}`}>
              {isActive ? "🟢 CLASE EN VIVO AHORA" : "SALA VIRTUAL COGNOS"}
            </span>
          </div>

          <h3 className="text-base font-extrabold text-[#00155C]">
            Sesiones Interactivas con el Docente
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <ClockIcon size={14} className="text-[#026BCA] dark:text-[#00BCE4]" />
              {schedule}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <CheckCircleIcon size={14} className="text-[#12AC81]" />
              Mínimo 80% de asistencia
            </span>
          </div>

          {/* Cuenta regresiva */}
          {!isActive && countdown && (
            <div className="mt-1 inline-flex items-center gap-2 rounded-lg bg-[#00155C]/8 dark:bg-white/10 px-3 py-1.5 text-xs font-bold text-[#00155C] dark:text-[#00BCE4]">
              <ClockIcon size={12} />
              Próxima clase en {countdown}
            </div>
          )}
        </div>

        {/* Botón de acceso */}
        {isActive ? (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${getProviderColor(provider)} px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#00155C]/25 transition-all hover:scale-105 active:scale-95 self-start sm:self-auto animate-pulse-subtle`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <span>Unirse a {getProviderLabel(provider)}</span>
            <span>→</span>
          </a>
        ) : (
          <div className="flex flex-col items-start sm:items-end gap-2">
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-[#101d31]/80 px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:border-[#026BCA] hover:text-[#026BCA] self-start sm:self-auto"
            >
              <span>Ver enlace de sala</span>
              <span>↗</span>
            </a>
            <span className="text-[10px] text-slate-400 text-right">
              El botón se activa 15 min antes de la clase
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
