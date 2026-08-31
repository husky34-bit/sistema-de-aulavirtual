'use client';

import { useState, useEffect } from 'react';
import { getCourseProgress } from '../actions/completion-actions';

interface ProgressBarProps {
  userId: string;
  courseId: string;
}

// Barra de progreso: completadas / totales por curso.
export function ProgressBar({ userId, courseId }: ProgressBarProps) {
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    let active = true;
    getCourseProgress(userId, courseId).then((result) => {
      if (active) setProgress(result);
    });
    return () => {
      active = false;
    };
  }, [userId, courseId]);

  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-600">
        {progress.completed}/{progress.total} ({pct}%)
      </span>
    </div>
  );
}
