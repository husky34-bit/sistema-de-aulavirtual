import { ClockIcon, CheckCircleIcon } from "@/components/Icons";

interface LiveClassBannerProps {
  courseTitle: string;
  schedule?: string;
  meetingUrl?: string;
}

export function LiveClassBanner({
  schedule = "Lunes a Viernes de 19:00 a 22:00 (GMT-4)",
  meetingUrl = "https://zoom.us",
}: LiveClassBannerProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#D0E5F7] bg-gradient-to-r from-[#F0F7FD] via-[#E8F3FC] to-[#DCEEFB] p-6 shadow-sm font-poppins">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#026BCA]">
              SALA VIRTUAL EN VIVO COGNOS
            </span>
          </div>

          <h3 className="text-base font-extrabold text-[#00155C]">
            Sesiones Interactivas con el Docente
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <ClockIcon size={14} className="text-[#026BCA]" />
              {schedule}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <CheckCircleIcon size={14} className="text-[#12AC81]" />
              Mínimo 80% de asistencia
            </span>
          </div>
        </div>

        <a
          href={meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00155C] to-[#026BCA] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#00155C]/25 transition-all hover:scale-105 active:scale-95 self-start sm:self-auto"
        >
          <span>Unirse a la Clase en Vivo</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
}
