'use client';

import { useTransition } from 'react';
import { participationReport } from '../actions/report-actions';
import { toCsv } from '../utils/csv';

interface OverviewData {
  courseTitle: string;
  enrolled: number;
  completions: number;
  averageGrade: number;
}

interface CompletionData {
  activities: { id: string; title: string }[];
  matrix: {
    student: { id: string; name: string; email: string };
    cells: { activityId: string; title: string; completed: boolean }[];
  }[];
}

interface CourseReportViewProps {
  courseId: string;
  overview: OverviewData | null;
  completion: CompletionData | null;
}

export function CourseReportView({ courseId, overview, completion }: CourseReportViewProps) {
  const [, startTransition] = useTransition();

  function exportCompletion() {
    if (!completion) return;
    const headers = ['Estudiante', 'Email', ...completion.activities.map((a) => a.title)];
    const rows = completion.matrix.map((m) => [
      m.student.name,
      m.student.email,
      ...m.cells.map((c) => (c.completed ? '✓' : '—')),
    ]);
    downloadCsv(toCsv(headers, rows), `completion-${courseId}.csv`);
  }

  function exportParticipation() {
    startTransition(async () => {
      const res = await participationReport(courseId);
      if (!res.success) return;
      const headers = ['Estudiante', 'Email', 'Matriculado', 'Última actividad'];
      const rows = res.data.map((p) => [
        p.student.name,
        p.student.email,
        new Date(p.enrolledAt).toLocaleDateString(),
        p.lastActivity ? new Date(p.lastActivity).toLocaleString() : 'Sin actividad',
      ]);
      downloadCsv(toCsv(headers, rows), `participation-${courseId}.csv`);
    });
  }

  function downloadCsv(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {overview && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-3xl font-bold text-slate-900">{overview.enrolled}</p>
            <p className="text-sm text-slate-500">Inscritos</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{overview.completions}</p>
            <p className="text-sm text-slate-500">Actividades completadas</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{overview.averageGrade}</p>
            <p className="text-sm text-slate-500">Promedio</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={exportCompletion} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          ↓ Exportar Completación CSV
        </button>
        <button onClick={exportParticipation} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          ↓ Exportar Participación CSV
        </button>
      </div>

      {completion && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-3 py-2">Estudiante</th>
                {completion.activities.map((a) => (
                  <th key={a.id} className="px-3 py-2 text-center">{a.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completion.matrix.map((row) => (
                <tr key={row.student.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-medium text-slate-900">{row.student.name}</td>
                  {row.cells.map((c) => (
                    <td key={c.activityId} className="px-3 py-2 text-center">
                      {c.completed ? <span className="text-emerald-600">✓</span> : <span className="text-slate-300">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
