'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { getAssignments } from '../actions/get-assignments';

interface AssignmentListItem {
  id: string;
  title: string;
  dueAt: string | Date | null;
  published: boolean;
  maxScore: number;
  _count: { submissions: number };
  section: { id: string; title: string } | null;
}

interface CourseAssignmentListProps {
  courseId: string;
  canEdit: boolean;
}

export function CourseAssignmentList({ courseId, canEdit }: CourseAssignmentListProps) {
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setAssignments((await getAssignments(courseId)) as AssignmentListItem[]);
    });
  }, [courseId]);

  return (
    <div className="space-y-3 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Tareas</h3>
        {canEdit && (
          <Link
            href={`/dashboard/courses/${courseId}/assign/new`}
            className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            + Nueva tarea
          </Link>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No hay tareas en este curso.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {assignments.map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/courses/${courseId}/assign/${a.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow"
            >
              <div className="flex items-start justify-between">
                <span className="font-medium text-slate-900">{a.title}</span>
                {a.published ? (
                  <span className="inline-flex rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700">
                    Publicada
                  </span>
                ) : (
                  <span className="inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                    Borrador
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Máx {a.maxScore} pts ·{' '}
                {a.dueAt
                  ? `Vence ${new Date(a.dueAt).toLocaleDateString()}`
                    : 'Sin fecha límite'}
                {' · '}
                {a._count.submissions} envío(s)
                {a.section ? ` · ${a.section.title}` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
