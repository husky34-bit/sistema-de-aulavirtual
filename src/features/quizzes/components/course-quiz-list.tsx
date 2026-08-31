'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { getQuizzes } from '../actions/get-quizzes';
import { CreateQuizModal } from './create-quiz-modal';

interface QuizListItem {
  id: string;
  title: string;
  published: boolean;
  timeLimitMin: number | null;
  maxAttempts: number;
  _count: { questions: number; attempts: number };
}

interface CourseQuizListProps {
  courseId: string;
  canEdit: boolean;
}

export function CourseQuizList({ courseId, canEdit }: CourseQuizListProps) {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setQuizzes((await getQuizzes(courseId)) as QuizListItem[]);
    });
  }, [courseId]);

  return (
    <div className="space-y-3 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Cuestionarios</h3>
        {canEdit && (
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            + Nuevo cuestionario
          </button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No hay cuestionarios en este curso.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/dashboard/courses/${courseId}/quiz/${quiz.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow"
            >
              <div className="flex items-start justify-between">
                <span className="font-medium text-slate-900">{quiz.title}</span>
                {quiz.published ? (
                  <span className="inline-flex rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700">
                    Publicado
                  </span>
                ) : (
                  <span className="inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                    Borrador
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {quiz._count.questions} preguntas ·{' '}
                {quiz.timeLimitMin ? `${quiz.timeLimitMin} min` : 'sin límite'} ·{' '}
                {quiz.maxAttempts === 0 ? 'intentos ilimitados' : `${quiz.maxAttempts} intento(s)`}
              </p>
            </Link>
          ))}
        </div>
      )}

      <CreateQuizModal
        courseId={courseId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
