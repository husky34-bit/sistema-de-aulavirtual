'use client';

import { useEffect, useRef, useState } from 'react';

interface QuizTimerProps {
  // segundos restantes al montar; null = sin límite
  initialSeconds: number | null;
  onExpire: () => void;
}

// Temporizador regresivo en cliente. Avisa de urgencia (<60s) y ejecuta
// onExpire una sola vez cuando llega a cero.
export function QuizTimer({ initialSeconds, onExpire }: QuizTimerProps) {
  const [seconds, setSeconds] = useState<number | null>(initialSeconds);
  const firedRef = useRef(false);

  useEffect(() => {
    if (seconds === null) return;
    if (seconds <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        onExpire();
      }
      return;
    }
    const id = setTimeout(() => setSeconds((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(id);
  }, [seconds, onExpire]);

  if (seconds === null) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
        Sin límite de tiempo
      </span>
    );
  }

  const urgent = seconds <= 60;
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-mono font-semibold tabular-nums ${
        urgent ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-700'
      }`}
    >
      ⏱ {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
    </span>
  );
}
