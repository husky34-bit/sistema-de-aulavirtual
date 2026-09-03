"use client";

import React, { useState, useTransition } from "react";
import {
  bulkImportStudents,
  BulkImportResult,
} from "../actions/bulk-import-students";
import { UploadIcon, CheckCircleIcon, XIcon } from "@/components/Icons";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses?: Array<{ id: string; title: string }>;
}

export function BulkImportModal({
  isOpen,
  onClose,
  courses = [],
}: BulkImportModalProps) {
  const [csvText, setCsvText] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text || "");
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!csvText.trim()) {
      setError("Por favor ingresa o sube los datos CSV.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await bulkImportStudents(
        csvText,
        selectedCourseId ? selectedCourseId : undefined
      );
      setResult(res);
    });
  };

  const handleReset = () => {
    setCsvText("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-poppins">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#101D31] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-[#D27C00] dark:text-amber-400">
              <UploadIcon size={18} />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#00155C] dark:text-white">
                Subir Usuarios Masivamente (CSV)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Importa decenas de estudiantes en un solo paso
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <XIcon size={18} />
          </button>
        </div>

        {result ? (
          /* Vista de Resultados */
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircleIcon size={16} />
                <span>Importación procesada con éxito</span>
              </div>
              <ul className="mt-2 space-y-1 text-emerald-700 dark:text-emerald-400 font-medium">
                <li>• Usuarios creados: <strong>{result.totalCreated}</strong></li>
                {result.totalEnrolled > 0 && (
                  <li>• Matrículas automáticas: <strong>{result.totalEnrolled}</strong></li>
                )}
                {result.errorsCount > 0 && (
                  <li className="text-amber-700 dark:text-amber-400">
                    • Filas con error: <strong>{result.errorsCount}</strong>
                  </li>
                )}
              </ul>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 p-2 text-[11px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <th className="py-1">Fila</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {result.details.map((d, i) => (
                    <tr key={i} className="py-1">
                      <td className="py-1 text-slate-400">{d.row}</td>
                      <td className="font-semibold text-slate-800 dark:text-slate-200">{d.name}</td>
                      <td className="text-slate-500">{d.email}</td>
                      <td>
                        <span
                          className={`font-bold ${
                            d.status === "created"
                              ? "text-emerald-600"
                              : d.status === "already_exists"
                              ? "text-blue-600"
                              : "text-red-500"
                          }`}
                        >
                          {d.status === "created"
                            ? "Creado"
                            : d.status === "already_exists"
                            ? "Existía"
                            : "Error"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Subir otro archivo
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-[#00155C] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#026BCA]"
              >
                Finalizar
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Carga */
          <div className="space-y-3 text-xs">
            {error && (
              <div className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Formato esperado (CSV o copiar/pegar):
              </label>
              <div className="rounded-lg bg-slate-100 dark:bg-slate-800/80 p-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                nombre,email,contraseña_opcional<br />
                Juan Perez,juan@ejemplo.com,Pass1234!<br />
                Maria Gomez,maria@ejemplo.com
              </div>
            </div>

            {courses.length > 0 && (
              <div>
                <label
                  htmlFor="bulkCourse"
                  className="block font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Matricular automáticamente en curso (opcional):
                </label>
                <select
                  id="bulkCourse"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#101D31] px-3 py-2 text-xs text-slate-800 dark:text-white"
                >
                  <option value="">-- No matricular en curso por ahora --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subir archivo .csv:
              </label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#EDF6FF] file:text-[#00155C] hover:file:bg-[#d8ecff]"
              />
            </div>

            <div>
              <label
                htmlFor="bulkCsvText"
                className="block font-bold text-slate-700 dark:text-slate-300 mb-1"
              >
                O pega las líneas aquí:
              </label>
              <textarea
                id="bulkCsvText"
                rows={4}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Nombre Completo,correo@ejemplo.com"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#101D31] p-2.5 font-mono text-xs text-slate-800 dark:text-slate-200 focus:border-[#026BCA] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00155C] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#026BCA] transition disabled:opacity-50"
              >
                {isPending ? "Procesando..." : "Iniciar Importación"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
