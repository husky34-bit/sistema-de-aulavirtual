'use client';

import { useState, useTransition, useRef } from 'react';
import { submitAssignment } from '../actions/submit-assignment';
import {
  FileTextIcon,
  DownloadIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@/components/Icons';

export interface SubmittedFileItem {
  id?: string;
  fileName: string;
  fileUrl: string;
  sizeBytes: number;
  mimeType: string;
}

interface SubmissionFormProps {
  assignmentId: string;
  allowOnlineText: boolean;
  allowFiles: boolean;
  initialText?: string | null;
  initialFiles?: SubmittedFileItem[];
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
  initialFiles = [],
  initialStatus,
  initialFeedback,
  initialScore,
  maxScore,
  isLate,
}: SubmissionFormProps) {
  const [text, setText] = useState(initialText ?? '');
  const [files, setFiles] = useState<SubmittedFileItem[]>(initialFiles);
  const [status, setStatus] = useState<'draft' | 'submitted' | 'graded' | null>(initialStatus ?? null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const locked = status === 'submitted' || status === 'graded';

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  async function handleFileUpload(selectedFiles: FileList | null) {
    if (!selectedFiles || selectedFiles.length === 0 || locked) return;
    setError(null);
    setIsUploading(true);

    try {
      const newUploadedFiles: SubmittedFileItem[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Validar tamaño máximo 50MB
        if (file.size > 50 * 1024 * 1024) {
          setError(`El archivo "${file.name}" supera el límite de 50 MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('contextType', 'submission');
        formData.append('contextId', assignmentId);

        const res = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error al subir "${file.name}"`);
        }

        const data = await res.json();
        newUploadedFiles.push({
          id: data.fileId,
          fileName: file.name,
          fileUrl: `/api/files/${data.fileId}`,
          sizeBytes: file.size,
          mimeType: file.type || 'application/octet-stream',
        });
      }

      setFiles((prev) => [...prev, ...newUploadedFiles]);
      setSuccess(`${newUploadedFiles.length} archivo(s) subido(s) correctamente.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir el archivo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemoveFile(indexToRemove: number) {
    if (locked) return;
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  function handleSubmit(mode: 'draft' | 'submit') {
    setError(null);
    setSuccess(null);

    if (mode === 'submit' && !text.trim() && files.length === 0) {
      setError('Debes ingresar una respuesta de texto o adjuntar al menos un archivo para enviar la entrega.');
      return;
    }

    startTransition(async () => {
      const payloadFiles = files.map((f) => ({
        fileName: f.fileName,
        fileUrl: f.fileUrl,
        sizeBytes: f.sizeBytes,
        mimeType: f.mimeType,
      }));

      const res = await submitAssignment({
        assignmentId,
        onlineText: text,
        files: payloadFiles,
        mode,
      });

      if (!res.success) {
        setError(('error' in res && res.error) ? res.error : 'Error al guardar la entrega');
        return;
      }

      setStatus(mode === 'submit' ? 'submitted' : 'draft');
      setSuccess(mode === 'submit' ? '¡Tarea / Laboratorio enviado con éxito!' : 'Borrador guardado correctamente.');
    });
  }

  return (
    <div className="space-y-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-6 shadow-sm">
      {/* Header Estado de Entrega */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-[#00155C] dark:text-white uppercase tracking-wider">
            Mi Entrega y Archivos de Trabajo
          </h3>
          <p className="text-xs text-slate-500">
            {locked
              ? 'Tu entrega ha sido enviada y se encuentra registrada en el sistema.'
              : 'Puedes redactar tu informe y adjuntar tus archivos antes del envío definitivo.'}
          </p>
        </div>

        {status && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                status === 'graded'
                  ? 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                  : status === 'submitted'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                  : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
              }`}
            >
              {status === 'graded' ? 'Calificado' : status === 'submitted' ? 'Entregado' : 'Borrador'}
              {isLate && status === 'submitted' && ' · Fuera de Plazo'}
            </span>
          </div>
        )}
      </div>

      {/* Retroalimentación de Calificación si está calificado */}
      {status === 'graded' && (
        <div className="border-l-4 border-l-[#026BCA] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#00155C] dark:text-[#00BCE4]">
              Resultado de la Evaluación
            </h4>
            <span className="text-sm font-extrabold text-[#00155C] dark:text-white">
              Nota: {initialScore ?? 0} / {maxScore} pts
            </span>
          </div>
          {initialFeedback && (
            <p className="mt-3 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {initialFeedback}
            </p>
          )}
        </div>
      )}

      {/* SECCIÓN 1: SUBIDA DE ARCHIVOS (Labs, Informes, Código, ZIPs) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Archivos Adjuntos {allowFiles ? '(Habilitado)' : ''}
          </label>
          <span className="text-[11px] text-slate-400">PDF, Word, ZIP, Imágenes, Código (Máx. 50 MB por archivo)</span>
        </div>

        {/* Zona Drag & Drop cuando no está bloqueado */}
        {!locked && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed p-6 text-center transition-colors ${
              isDragging
                ? 'border-[#026BCA] bg-[#EDF6FF] dark:bg-[#10233e]'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:border-[#00155C] dark:hover:border-[#00BCE4]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <div className="mx-auto flex h-10 w-10 items-center justify-center border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#00155C] dark:text-[#00BCE4] mb-2">
              <DownloadIcon size={20} className="rotate-180" />
            </div>
            <p className="text-xs font-bold text-[#00155C] dark:text-white">
              {isUploading ? 'Subiendo archivos al servidor...' : 'Arrastra y suelta tus archivos aquí o haz clic para examinar'}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Sube tus documentos del laboratorio, capturas de pantalla, archivos comprimidos o proyectos.
            </p>
          </div>
        )}

        {/* Lista de Archivos Adjuntos */}
        {files.length > 0 ? (
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Archivos en esta entrega ({files.length}):
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {files.map((file, idx) => (
                <div
                  key={file.id ?? idx}
                  className="flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base">📄</span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-[#00155C] dark:text-white truncate">
                        {file.fileName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatBytes(file.sizeBytes)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={file.fileName}
                      className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px] font-bold text-[#026BCA] hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Descargar
                    </a>
                    {!locked && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="border border-red-200 bg-red-50 p-1 text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                        title="Eliminar archivo"
                      >
                        <TrashIcon size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : locked ? (
          <p className="text-xs italic text-slate-400 py-2">No se adjuntaron archivos en este envío.</p>
        ) : null}
      </div>

      {/* SECCIÓN 2: TEXTO EN LÍNEA / INFORME ESCRITO */}
      {allowOnlineText && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Respuesta o Informe en Línea
          </label>

          {!locked ? (
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={20000}
                rows={8}
                className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#00155C] dark:focus:border-[#00BCE4]"
                placeholder="Escribe tu informe, resumen de laboratorio, respuestas teóricas o enlaces de repositorios aquí…"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                <span>Introduce el texto explicativo de tu entrega si es necesario.</span>
                <span>{text.length} / 20000 caracteres</span>
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 text-xs whitespace-pre-wrap text-slate-800 dark:text-slate-200">
              {text || '(Sin texto escrito)'}
            </div>
          )}
        </div>
      )}

      {/* Alertas de Error y Éxito */}
      {error && (
        <div className="border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="border border-emerald-300 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          {success}
        </div>
      )}

      {/* Botones de Acción */}
      {!locked && (
        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={isUploading}
            className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            Guardar Borrador
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('submit')}
            disabled={isUploading}
            className="border border-[#00155C] bg-[#00155C] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#026BCA] dark:border-[#00BCE4] dark:bg-[#00BCE4] dark:text-[#00155C] dark:hover:bg-white transition disabled:opacity-50 shadow-sm"
          >
            Enviar Entrega Definitiva →
          </button>
        </div>
      )}
    </div>
  );
}
