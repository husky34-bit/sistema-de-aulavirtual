'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { startAttempt } from '../actions/start-attempt';

interface StartAttemptButtonProps {
  quizId: string;
  courseId: string;
  canStart: boolean;
}

export function StartAttemptButton({ quizId, courseId, canStart }: StartAttemptButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const res = await startAttempt(quizId);
      if (res.success) {
        router.push(
          `/dashboard/courses/${courseId}/quiz/${quizId}/attempt/${res.attemptId}`
        );
      } else {
        alert(res.error ?? 'No se pudo iniciar el intento');
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={!canStart || isPending}
      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? 'Iniciando...' : 'Iniciar intento'}
    </button>
  );
}
