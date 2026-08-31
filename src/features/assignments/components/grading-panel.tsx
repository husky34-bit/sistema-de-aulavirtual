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

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-slate-900">{userName}</h4>
          <p className="text-xs text-slate-500">{userEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          {isLate && (
            <span className="inline-flex rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
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

      {onlineText && (
        <div className="rounded-lg bg-slate-50 p-4 text-sm whitespace-pre-wrap text-slate-700 max-h-64 overflow-auto">
          {onlineText}
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
