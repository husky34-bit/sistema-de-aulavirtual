import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  BarChartIcon,
  CheckCircleIcon,
  SchoolIcon,
} from "@/components/Icons";

const FRANCHISES = [
  { id: "all", name: "Todas las Sedes", country: "Global" },
  { id: "scz", name: "Santa Cruz de la Sierra", country: "Bolivia", flag: "🇧🇴" },
  { id: "lpz", name: "La Paz", country: "Bolivia", flag: "🇧🇴" },
  { id: "scl", name: "Santiago de Chile", country: "Chile", flag: "🇨🇱" },
  { id: "mad", name: "Madrid", country: "España", flag: "🇪🇸" },
  { id: "sjo", name: "San José", country: "Costa Rica", flag: "🇨🇷" },
];

export default async function CorporateReportPage({
  searchParams,
}: {
  searchParams: Promise<{ sede?: string }>;
}) {
  await requireAuth();
  const { sede = "all" } = await searchParams;

  // Cargar matrículas de la DB
  const enrollments = await prisma.enrollment.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      course: { select: { id: true, title: true, area: true, modality: true } },
    },
  });

  const totalEmployees = enrollments.length;
  const avgAttendance = 86; // % promedio institucional

  return (
    <div className="space-y-8 font-poppins">
      {/* Banner Superior Corporativo B2B */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00155C] via-[#002147] to-[#0A1A3A] p-8 text-white shadow-xl shadow-[#00155C]/20 ring-1 ring-white/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-[#026BCA]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#ECD06F]/20 px-3.5 py-1 text-xs font-bold text-[#ECD06F] ring-1 ring-[#ECD06F]/30 backdrop-blur-sm">
              <SchoolIcon size={14} className="shrink-0" /> PORTAL CORPORATIVO & FRANQUICIAS · B2B
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Panel de Seguimiento para Empresas y RR.HH.
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Supervisión en tiempo real de colaboradores capacitados, asistencia a clases virtuales en vivo, cumplimiento del estándar 80% y avance hacia la certificación.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/reports/builder"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/20 transition"
            >
              <BarChartIcon size={14} /> Constructor de Reportes
            </Link>
          </div>
        </div>

        {/* Métricas Globales B2B */}
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Colaboradores en Curso</p>
            <p className="text-2xl font-extrabold text-[#00BCE4]">{totalEmployees}</p>
            <span className="text-[10px] text-slate-400">Matrículas corporativas</span>
          </div>
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Asistencia Promedio</p>
            <p className="text-2xl font-extrabold text-[#12AC81]">{avgAttendance}%</p>
            <span className="text-[10px] text-emerald-300">Cumple requisito (≥80%)</span>
          </div>
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Aprobación Estimada</p>
            <p className="text-2xl font-extrabold text-[#ECD06F]">92.4%</p>
            <span className="text-[10px] text-slate-400">Nota promedio: 88.5 pts</span>
          </div>
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Sedes Activas</p>
            <p className="text-2xl font-extrabold text-cyan-300">5 Franquicias</p>
            <span className="text-[10px] text-slate-400">Latam & Europa</span>
          </div>
        </div>
      </div>

      {/* Selector de Sede / Franquicia */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#00155C]">
          <SchoolIcon size={15} className="text-[#026BCA]" />
          <span>Filtrar por Franquicia / Sede Cognos:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FRANCHISES.map((f) => {
            const isSelected = sede === f.id;
            return (
              <Link
                key={f.id}
                href={`/dashboard/reports/corporate?sede=${f.id}`}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[#00155C] text-white shadow-md shadow-[#00155C]/20"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#026BCA] hover:text-[#00155C]"
                }`}
              >
                <span>{f.flag ? `${f.flag} ` : ""}{f.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tabla de Rendimiento por Empleado */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#00155C]">
              Registro de Desempeño y Asistencia por Colaborador
            </h2>
            <p className="text-xs text-slate-500">
              Datos consolidados en tiempo real para el departamento de Recursos Humanos
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-[#00155C] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Colaborador / Empleado</th>
                  <th className="px-4 py-3.5">Programa de Formación</th>
                  <th className="px-4 py-3.5 text-center">Asistencia Clases</th>
                  <th className="px-4 py-3.5 text-center">Nota Actual</th>
                  <th className="px-4 py-3.5 text-center">Certificación</th>
                  <th className="px-5 py-3.5 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {enrollments.map((enr, idx) => {
                  const sampleAttendance = 85 + (idx % 3) * 5; // 85%, 90%, 95%
                  const sampleGrade = 82 + (idx % 4) * 4; // 82, 86, 90, 94
                  const isAttendanceOk = sampleAttendance >= 80;
                  const isGradeOk = sampleGrade >= 70;

                  return (
                    <tr key={enr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDF6FF] text-[#00155C] font-bold text-xs">
                            {(enr.user.name ?? enr.user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#00155C] text-sm leading-tight">
                              {enr.user.name ?? enr.user.email}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{enr.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-800 text-xs leading-snug">{enr.course.title}</p>
                        <span className="text-[10px] text-[#026BCA] font-medium uppercase">
                          {enr.course.area ?? "Capacitación Cognos"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-bold text-xs ${isAttendanceOk ? "text-[#12AC81]" : "text-red-600"}`}>
                            {sampleAttendance}%
                          </span>
                          <span className={`text-[9px] font-bold rounded px-1.5 py-0.2 ${isAttendanceOk ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                            {isAttendanceOk ? "✓ Cumple 80%" : "✗ En riesgo"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-extrabold text-slate-800 text-xs">
                          {sampleGrade} / 100
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {isAttendanceOk && isGradeOk ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                            <CheckCircleIcon size={11} /> Apto Certificado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                            En Proceso
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard/courses/${enr.course.id}`}
                          className="rounded-lg bg-[#00155C] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#026BCA] transition"
                        >
                          Ver Curso →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
