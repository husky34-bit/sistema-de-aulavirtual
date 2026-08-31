'use client';

import { useState, useTransition } from 'react';
import { gradeSubmission } from '../actions/grade-submission';
import { grantExtension } from '../actions/grant-extension';

interface GradingPanelProps {
  submissionId: string;
  assignmentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  maxScore: number;
  initialScore?: number | null;
  initialFeedback?: string | null;
  submittedAt?: Date | string | null;
  isLate?: boolean;
  onlineText?: string | null;
  files?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    sizeBytes: number;
    mimeType: string;
  }>;
}

export function GradingPanel({
  submissionId,
  assignmentId,
  userId,
  userName,
  userEmail,
  maxScore,
  initialScore,
  initialFeedback,
  submittedAt,
  isLate,
  onlineText,
  files,
}: GradingPanelProps) {
  const [score, setScore] = useState<string>(initialScore !== null && initialScore !== undefined ? String(initialScore) : '');
  const [feedback, setFeedback] = useState(initialFeedback ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showExtension, setShowExtension] = useState(false);
  const [extensionDate, setExtensionDate] = useState('');
  const [, startTransition] = useTransition();

  function handleGrade() {
    setError(null);
    setSuccess(null);
    const numScore = Number(score);
    if (Number.isNaN(numScore) || numScore < 0) {
      setError('Introduce una nota válida');
      return;
    }
    startTransition(async () => {
      const res = await gradeSubmission({ submissionId, score: numScore, feedback });
      if (!res.success) {
        setError(('error' in res && res.error) ? res.error : 'Error al calificar');
        return;
      }
      setSuccess('Calificación guardada y sincronizada con el gradebook');
    });
  }

  function handleExtension() {
    setError(null);
    setSuccess(null);
    if (!extensionDate) {
      setError('Selecciona una fecha para la extensión');
      return;
    }
    startTransition(async () => {
      const res = await grantExtension({
        assignmentId,
        userId,
        dueAt: new Date(extensionDate).toISOString(),
      });
      if (!res.success) {
        setError(('error' in res && res.error) ? res.error : 'Error al conceder extensión');
        return;
      }
      setSuccess('Extensión concedida');
      setShowExtension(false);
    });
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <div className="space-y-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h4 className="font-bold text-[#00155C] dark:text-white">{userName}</h4>
          <p className="text-xs text-slate-500">{userEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          {isLate && (
            <span className="inline-flex border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">
              Entrega tardía
            </span>
          )}
          {submittedAt && (
            <span className="text-xs text-slate-500">
              {new Date(submittedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Online Text Response */}
      {onlineText && (
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Respuesta en línea:</h5>
          <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 text-xs whitespace-pre-wrap text-slate-800 dark:text-slate-200 max-h-64 overflow-auto">
            {onlineText}
          </div>
        </div>
      )}

      {/* Attached Files */}
      {files && files.length > 0 && (
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Archivos adjuntos ({files.length}):
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.map((file) => (
              <a
                key={file.id}
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={file.fileName}
                className="flex items-center justify-between border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 hover:border-[#026BCA] dark:hover:border-[#00BCE4] transition"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm">📎</span>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#00155C] dark:text-white truncate">{file.fileName}</p>
                    <p className="text-[10px] text-slate-500">{formatBytes(file.sizeBytes)}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#026BCA] shrink-0 ml-2">Descargar ↓</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nota (máx {maxScore})
          </label>
          <input
            type="number"
            min={0}
            max={maxScore}
            step="0.5"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleGrade}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Guardar calificación
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Retroalimentación</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Retroalimentación para el estudiante…"
        />
      </div>

      <details className="text-sm">
        <summary
          className="cursor-pointer text-slate-600 hover:text-slate-900"
          onClick={(e) => {
            e.preventDefault();
            setShowExtension((s) => !s);
          }}
        >
          Conceder extensión individual
        </summary>
        {showExtension && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 p-3">
            <input
              type="datetime-local"
              value={extensionDate}
              onChange={(e) => setExtensionDate(e.target.value)}
              className="rounded-lg border border-slate-300 p-2 text-sm"
            />
            <button
              onClick={handleExtension}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Conceder
            </button>
          </div>
        )}
      </details>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
    </div>
  );
}
