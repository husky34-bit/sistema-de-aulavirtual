'use client';

import { useState } from 'react';

interface Chapter {
  id: string;
  title: string;
  content: string;
  position: number;
}

interface ChapterViewerProps {
  courseId: string;
  chapters: Chapter[];
}

// Visor de capítulos de un libro con navegación anterior/siguiente.
export function ChapterViewer({ courseId, chapters }: ChapterViewerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const sorted = [...chapters].sort((a, b) => a.position - b.position);
  const chapter = sorted[currentIdx];

  void courseId;

  if (sorted.length === 0) {
    return <p className="text-sm text-slate-500">Este libro no tiene capítulos.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Tabla de contenidos */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Capítulos</h3>
        <div className="space-y-1">
          {sorted.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setCurrentIdx(idx)}
              className={`block w-full rounded px-3 py-1.5 text-left text-sm transition ${
                idx === currentIdx
                  ? 'bg-blue-50 font-medium text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {idx + 1}. {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido del capítulo */}
      <div className="prose prose-slate max-w-none rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900">{chapter.title}</h2>
        <div
          className="mt-4"
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />
      </div>

      {/* Navegación */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          ← Anterior
        </button>
        <span className="text-sm text-slate-500">
          Capítulo {currentIdx + 1} de {sorted.length}
        </span>
        <button
          onClick={() => setCurrentIdx((i) => Math.min(sorted.length - 1, i + 1))}
          disabled={currentIdx === sorted.length - 1}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
