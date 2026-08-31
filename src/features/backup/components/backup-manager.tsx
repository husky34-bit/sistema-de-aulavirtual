'use client';

import { useState, useTransition } from 'react';
import { exportCourseBackup, importCourseBackup } from '../actions/backup-actions';

interface BackupManagerProps {
  courseId: string;
}

export function BackupManager({ courseId }: BackupManagerProps) {
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleExport() {
    setMessage(null);
    startTransition(async () => {
      const res = await exportCourseBackup(courseId);
      if (res.success) {
        const json = JSON.stringify(res.backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${courseId}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage('Respaldo exportado correctamente');
      }
    });
  }

  function handleImport() {
    setMessage(null);
    if (!importText.trim()) {
      setMessage('Pega el JSON del respaldo');
      return;
    }
    startTransition(async () => {
      const res = await importCourseBackup(importText);
      if (res.success) {
        setMessage(`Curso restaurado con ID: ${res.courseId}`);
        setImportText('');
      } else {
        setMessage(res.error ?? 'Error al importar');
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold text-slate-900">Exportar respaldo</h3>
        <p className="mt-1 text-sm text-slate-500">
          Descarga el contenido del curso como JSON portable (sin usuarios ni matrículas).
        </p>
        <button
          onClick={handleExport}
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          ↓ Descargar respaldo JSON
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold text-slate-900">Importar respaldo</h3>
        <p className="mt-1 text-sm text-slate-500">
          Pega el JSON de un respaldo para restaurar el curso (se crea como nuevo curso).
        </p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={8}
          className="mt-3 w-full rounded-lg border border-slate-300 p-2 font-mono text-xs"
          placeholder='{"version":"1.0",...}'
        />
        <button
          onClick={handleImport}
          className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Importar
        </button>
      </div>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}
