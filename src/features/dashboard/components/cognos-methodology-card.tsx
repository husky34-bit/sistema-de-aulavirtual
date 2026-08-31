"use client";

import { useState } from "react";
import { CheckCircleIcon, BookOpenIcon, UsersIcon, AwardIcon, TrendingUpIcon } from "@/components/Icons";

const STEPS = [
  {
    step: 1,
    title: "Bienvenida y Claves de Acceso",
    short: "Acceso Seguro",
    icon: CheckCircleIcon,
    description:
      "Tus credenciales personales son enviadas a tu correo institucional. Soporte técnico y académico permanente durante todo tu ciclo formativo.",
    badge: "Paso Inicial",
  },
  {
    step: 2,
    title: "Navegación por tu Aula Virtual",
    short: "Tablero & Cronograma",
    icon: BookOpenIcon,
    description:
      "Accede al tablero principal, explora los materiales por módulos, agenda las fechas de clases en vivo y organiza tu calendario de estudio.",
    badge: "Organización",
  },
  {
    step: 3,
    title: "Desarrollo de Actividades & Clases en Vivo",
    short: "Clases & Laboratorios",
    icon: UsersIcon,
    description:
      "Participa en las sesiones interactivas con instructores certificados, resuelve laboratorios prácticos en entornos reales y comparte en los foros de debate.",
    badge: "Interactividad",
  },
  {
    step: 4,
    title: "Seguimiento de Progreso & Asistencia",
    short: "Monitoreo Continuo",
    icon: TrendingUpIcon,
    description:
      "Monitorea tus calificaciones en el Libro de Notas y verifica tu asistencia. Recuerda que se requiere un mínimo de 80% de asistencia a clases en vivo.",
    badge: "80% Asistencia",
  },
  {
    step: 5,
    title: "Evaluación & Certificación Oficial",
    short: "Certificado Cognos",
    icon: AwardIcon,
    description:
      "Rinde tus evaluaciones finales. Con una nota mínima de 70/100 puntos obtienes la Certificación Cognos verificable con QR y voucher internacional de marca.",
    badge: "70 pts Mínimo",
  },
];

export function CognosMethodologyCard() {
  const [activeStep, setActiveStep] = useState(0);
  const current = STEPS[activeStep];
  const Icon = current.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm font-poppins">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="inline-block text-[11px] font-bold tracking-widest text-[#026BCA] uppercase">
            Metodología de Aprendizaje
          </span>
          <h3 className="text-lg font-extrabold text-[#00155C]">
            Tu Ruta de Éxito en 5 Pasos
          </h3>
        </div>
        <span className="rounded-full bg-[#EDF6FF] px-3 py-1 text-xs font-bold text-[#00155C] ring-1 ring-[#00155C]/15 self-start sm:self-auto">
          Estándar Académico Cognos
        </span>
      </div>

      {/* Step Selector Pills */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2">
        {STEPS.map((s, idx) => {
          const isSelected = activeStep === idx;
          return (
            <button
              key={s.step}
              onClick={() => setActiveStep(idx)}
              className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all duration-200 text-xs ${
                isSelected
                  ? "border-[#00155C] bg-[#00155C] text-white shadow-md shadow-[#00155C]/25"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isSelected ? "text-[#00BCE4]" : "text-[#026BCA]"}`}>
                Paso {s.step}
              </span>
              <span className="mt-0.5 font-bold line-clamp-1">{s.short}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Content */}
      <div className="mt-5 rounded-xl bg-gradient-to-r from-[#F0F7FD] to-[#EBF3FA] dark:from-[#0d1f38] dark:to-[#102746] p-5 border border-[#D5E7F7] dark:border-[#1e3a61] flex flex-col sm:flex-row items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00155C] text-[#00BCE4] shadow-md">
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#00155C] dark:bg-[#026BCA] px-2 py-0.5 text-[10px] font-extrabold text-white">
              PASO {current.step} DE 5
            </span>
            <span className="rounded-md bg-[#026BCA]/15 dark:bg-[#00BCE4]/20 px-2 py-0.5 text-[10px] font-bold text-[#00155C] dark:text-[#00BCE4]">
              {current.badge}
            </span>
          </div>
          <h4 className="mt-2 text-base font-extrabold text-[#00155C] dark:text-white">
            {current.title}
          </h4>
          <p className="mt-1 text-xs text-slate-700 dark:text-[#d0ddf0] leading-relaxed font-normal">
            {current.description}
          </p>
        </div>
      </div>
    </div>
  );
}
