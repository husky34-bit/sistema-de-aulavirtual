'use client';

import { useState, useTransition } from 'react';
import { submitAssignment } from '../actions/submit-assignment';

interface SubmissionFormProps {
  assignmentId: string;
  allowOnlineText: boolean;
  allowFiles: boolean;
  initialText?: string | null;
  initialStatus?: 'draft' | 'submitted' | 'graded' | null;
  initialFeedback?: string | null;
  initialScore?: number | null;
  maxScore: number;
  isLate?: boolean;
}

export function SubmissionForm({
  assignmentId,
  allowOnlineText,
  allowFiles,
  initialText,
  initialStatus,
  initialFeedback,
  initialScore,
  maxScore,
  isLate,
}: SubmissionFormProps) {
  const [text, setText] = useState(initialText ?? '');
  const [status, setStatus] = useState<'draft' | 'submitted' | 'graded' | null>(initialStatus ?? null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleSubmit(mode: 'draft' | 'submit') {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      if (!allowOnlineText && allowFiles) {
        setError('La subida de archivos aún no está implementada en esta demo.');
        return;
      }
      const res = await submitAssignment({ assignmentId, onlineText: text, mode });
      if (!res.success) {
        setError(('error' in res && res.error) ? res.error : 'Error al guardar');
        return;
      }
      setStatus(mode === 'submit' ? 'submitted' : 'draft');
      setSuccess(mode === 'submit' ? 'Tarea enviada correctamente' : 'Borrador guardado');
    });
  }

  const locked = status === 'submitted' || status === 'graded';

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Mi entrega</h3>
        {status && (
          <span
            className={`inline-flex rounded px-2 py-0.5 text-xs ${
              status === 'graded'
                ? 'bg-blue-100 text-blue-700'
                : status === 'submitted'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
            }`}
          >
            {status === 'graded' ? 'Calificado' : status === 'submitted' ? 'Enviado' : 'Borrador'}
            {isLate && status === 'submitted' && ' · Tardío'}
          </span>
        )}
      </div>

      {status === 'graded' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
          <p className="font-medium text-blue-900">
            Nota: {initialScore}/{maxScore}
          </p>
          {initialFeedback && (
            <p className="mt-2 whitespace-pre-wrap text-blue-800">{initialFeedback}</p>
          )}
        </div>
      )}

      {allowOnlineText && !locked && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Respuesta en línea
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={20000}
            rows={10}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Escribe tu respuesta aquí…"
          />
          <p className="mt-1 text-xs text-slate-400">{text.length}/20000 caracteres</p>
        </div>
      )}

      {locked && allowOnlineText && (
        <div className="rounded-lg bg-slate-50 p-4 text-sm whitespace-pre-wrap text-slate-700">
          {text || '(sin texto)'}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}

      {!locked && (
        <div className="flex gap-2">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={!allowOnlineText}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            Guardar borrador
          </button>
          <button
            onClick={() => handleSubmit('submit')}
            disabled={!allowOnlineText}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            Enviar tarea
          </button>
        </div>
      )}
    </div>
  );
}
