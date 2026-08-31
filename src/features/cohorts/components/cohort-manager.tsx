'use client';

import { useState, useTransition } from 'react';
import { manageCohort, uploadCohortCsv, cohortSync } from '../actions/cohort-actions';

interface Cohort {
  id: string;
  name: string;
  memberCount: number;
}

interface CohortManagerProps {
  cohorts: Cohort[];
}

export function CohortManager({ cohorts }: CohortManagerProps) {
  const [name, setName] = useState('');
  const [csvText, setCsvText] = useState('');
  const [syncCourse, setSyncCourse] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleCreate() {
    if (!name.trim()) return;
    startTransition(async () => {
      await manageCohort({ name });
      setName('');
      window.location.reload();
    });
  }

  function handleCsv(cohortId: string) {
    if (!csvText.trim()) return;
    startTransition(async () => {
      const res = await uploadCohortCsv(cohortId, csvText);
      if (res.success) {
        setMessage(`Importados: ${res.results.filter((r) => r.status === 'ok').length}, errores: ${res.results.filter((r) => r.status === 'error').length}`);
      }
    });
  }

  function handleSync(cohortId: string) {
    if (!syncCourse.trim()) return;
    startTransition(async () => {
      const res = await cohortSync(cohortId, syncCourse);
      if (res.success) setMessage(`Sincronizados ${res.enrolled} estudiantes`);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la cohorte"
          className="flex-1 rounded-lg border border-slate-300 p-2 text-sm"
        />
        <button onClick={handleCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Crear
        </button>
      </div>

      {cohorts.map((c) => (
        <div key={c.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-900">{c.name}</span>
            <span className="text-xs text-slate-500">{c.memberCount} miembros</span>
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer text-blue-600 hover:underline">Subir CSV de miembros (emails)</summary>
            <div className="mt-2 space-y-2">
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={4}
                placeholder="email1@ejemplo.com&#10;email2@ejemplo.com"
                className="w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
              <button onClick={() => handleCsv(c.id)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">Importar CSV</button>
            </div>
          </details>
          <details className="text-sm">
            <summary className="cursor-pointer text-blue-600 hover:underline">Sincronizar con matrículas de curso</summary>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={syncCourse}
                onChange={(e) => setSyncCourse(e.target.value)}
                placeholder="ID del curso"
                className="flex-1 rounded-lg border border-slate-300 p-2 text-sm"
              />
              <button onClick={() => handleSync(c.id)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">Sincronizar</button>
            </div>
          </details>
        </div>
      ))}

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}
