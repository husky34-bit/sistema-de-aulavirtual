'use client';

import { useState, useTransition } from 'react';
import { runReport, ReportSource, ReportOutput } from '@/features/reports/services/report-builder';
import { BarChartIcon, DownloadIcon } from '@/components/Icons';

export default function ReportBuilderPage() {
  const [source, setSource] = useState<ReportSource>('users');
  const [report, setReport] = useState<ReportOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const res = await runReport(source);
      if (res.success && res.data) {
        setReport(res.data);
      }
    });
  }

  function downloadCsv() {
    if (!report) return;
    const header = report.columns.join(',');
    const rows = report.rows
      .map((r) =>
        report.columns
          .map((c) => {
            const val = r[c] ?? '';
            return `"${String(val).replaceAll('"', '""')}"`;
          })
          .join(',')
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + header + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${source}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          <BarChartIcon size={14} className="shrink-0" /> Constructor de Reportes
        </div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Reportes Personalizados
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Genera reportes tabulares por fuentes institucionales y expórtalos a formato CSV
        </p>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="source-select" className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Fuente de Datos
          </label>
          <select
            id="source-select"
            value={source}
            onChange={(e) => setSource(e.target.value as ReportSource)}
            className="rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="users">Directorio de Usuarios</option>
            <option value="enrollments">Matrículas de Cursos</option>
            <option value="grades">Libro de Calificaciones</option>
            <option value="quizzes">Intentos de Cuestionarios</option>
          </select>
        </div>

        <div className="flex items-end gap-2 pt-5">
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
          >
            {isPending ? 'Generando...' : 'Generar Reporte'}
          </button>

          {report && report.rows.length > 0 && (
            <button
              onClick={downloadCsv}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
            >
              <DownloadIcon size={15} className="shrink-0" /> Exportar CSV
            </button>
          )}
        </div>
      </div>

      {/* Tabla de resultados */}
      {report && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-700">
              Total de registros: {report.rows.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold">
                <tr>
                  {report.columns.map((col) => (
                    <th key={col} className="px-4 py-3">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {report.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition">
                    {report.columns.map((col) => (
                      <td key={col} className="px-4 py-3 font-medium">
                        {String(row[col] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
