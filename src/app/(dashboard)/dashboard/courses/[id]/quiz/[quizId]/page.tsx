import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { getQuizById } from '@/features/quizzes/actions/get-quiz-by-id';
import {
  getAttemptHistory,
  getActiveAttempt,
} from '@/features/quizzes/actions/get-attempt-history';
import { resolveEffectiveConfig } from '@/features/quizzes/services/attempt-engine';
import { EditIcon } from '@/components/Icons';
import {
  computeFinalGrade,
  normalizeAttemptGrade,
} from '@/features/quizzes/services/grading-engine';
import { StartAttemptButton } from '@/features/quizzes/components/start-attempt-button';

const METHOD_LABELS: Record<string, string> = {
  highest: 'Mejor intento',
  average: 'Promedio',
  first: 'Primer intento',
  last: 'Último intento',
};

export default async function QuizCoverPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const user = await requireAuth();
  const { id: courseId, quizId } = await params;

  const quiz = await getQuizById(quizId);
  if (!quiz || quiz.course.id !== courseId) notFound();

  const canEdit =
    quiz.course.instructorId === user.id || user.role === 'ADMIN';

  let override: { timeLimitMin: number | null; maxAttempts: number | null; openAt: Date | null; closeAt: Date | null } | null = null;
  try {
    override = await prisma.quizOverride.findUnique({
      where: { quizId_userId: { quizId, userId: user.id } },
    });
  } catch {
    override = null;
  }
  const config = resolveEffectiveConfig(quiz, override);

  const [history, activeAttempt] = await Promise.all([
    getAttemptHistory(quizId),
    getActiveAttempt(quizId),
  ]);

  const finished = history.filter((a) => a.state === 'finished');
  const finishedGrades = finished
    .map((a) => ({
      attemptNumber: a.attemptNumber,
      grade: normalizeAttemptGrade(a.totalScore, a.maxScore) ?? 0,
      finishedAt: a.finishedAt ?? a.startedAt,
    }));
  const finalGrade = computeFinalGrade(quiz.gradeMethod, finishedGrades);

  const now = new Date();
  const isClosed = config.closeAt ? now > config.closeAt : false;
  const isOpen = config.openAt ? now >= config.openAt : true;
  const canStart = quiz.published && isOpen && !isClosed && !activeAttempt;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="text-xs text-blue-600 hover:underline"
        >
          ← Volver al curso
        </Link>
        <div className="mt-1 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
            {quiz.description && (
              <p className="mt-2 text-slate-600">{quiz.description}</p>
            )}
          </div>
          {canEdit && (
            <Link
              href={`/dashboard/courses/${courseId}/quiz/${quizId}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <EditIcon size={14} className="shrink-0" /> Editar
            </Link>
          )}
        </div>
      </div>

      {/* Resumen de configuración */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-4">
        <Info label="Tiempo límite">
          {config.timeLimitMin ? `${config.timeLimitMin} min` : 'Sin límite'}
        </Info>
        <Info label="Intentos máx.">
          {config.maxAttempts === 0 ? 'Ilimitados' : config.maxAttempts}
        </Info>
        <Info label="Calificación">{METHOD_LABELS[quiz.gradeMethod]}</Info>
        <Info label="Preguntas">{quiz.questions.length}</Info>
      </div>

      {/* Estado de publicación / ventana */}
      {!quiz.published && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
          Este cuestionario no está publicado todavía.
        </div>
      )}
      {quiz.published && !isOpen && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600">
          Se abrirá el {config.openAt?.toLocaleString()}.
        </div>
      )}
      {quiz.published && isClosed && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          El período de realización ha finalizado.
        </div>
      )}

      {/* Intento en curso */}
      {activeAttempt && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="font-semibold text-blue-900">Intento en curso</h3>
          <p className="mt-1 text-sm text-blue-700">
            Tienes el intento #{activeAttempt.attemptNumber} empezado el{' '}
            {new Date(activeAttempt.startedAt).toLocaleString()}.
          </p>
          <Link
            href={`/dashboard/courses/${courseId}/quiz/${quizId}/attempt/${activeAttempt.id}`}
            className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Reanudar intento →
          </Link>
        </div>
      )}

      {/* Iniciar nuevo intento */}
      {!activeAttempt && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#00155C]">
                <span>Modo Estándar</span>
              </div>
              <h3 className="mt-2 font-extrabold text-base text-slate-900">Iniciar Evaluación Oficial</h3>
              <p className="mt-1 text-xs text-slate-500">
                Intentos realizados: {finished.length}
                {config.maxAttempts > 0
                  ? ` de ${config.maxAttempts} permitidos`
                  : ' (sin límite)'}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Tu calificación final formará parte del Libro de Calificaciones y del cálculo del requisito para la Certificación Cognos (≥ 70 pts).
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <StartAttemptButton quizId={quizId} courseId={courseId} canStart={canStart} />
            </div>
          </div>

          {/* Simulador Mock Exam */}
          <div className="rounded-2xl border border-[#D0E5F7] bg-gradient-to-br from-[#00155C] to-[#0A1A3A] p-6 text-white shadow-xl shadow-[#00155C]/20 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-[#026BCA]/30 blur-2xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#00BCE4]/20 px-2.5 py-0.5 text-xs font-bold text-[#00BCE4] ring-1 ring-[#00BCE4]/30">
                <span>⚡ SIMULADOR INTERNACIONAL</span>
              </div>
              <h3 className="mt-2 font-extrabold text-base text-white">Modo Mock Exam</h3>
              <p className="mt-1 text-xs text-slate-300">
                Entrenamiento cronometrado con condiciones reales de certificación internacional (PMP®, CEH, AWS).
              </p>
              <ul className="mt-3 space-y-1 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5">✓ Preguntas aleatorias sin penalización</li>
                <li className="flex items-center gap-1.5">✓ Cronómetro estricto en tiempo real</li>
                <li className="flex items-center gap-1.5">✓ Retroalimentación inmediata al finalizar</li>
              </ul>
            </div>
            <div className="relative z-10 mt-4 pt-4 border-t border-white/10">
              <StartAttemptButton quizId={quizId} courseId={courseId} canStart={canStart} />
            </div>
          </div>
        </div>
      )}

      {/* Historial de intentos */}
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase text-slate-500">
          Historial de intentos
        </h3>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no has realizado intentos.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <th className="p-3">#</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Inicio</th>
                  <th className="p-3">Fin</th>
                  <th className="p-3">Nota</th>
                  <th className="p-3 text-right">Revisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((a) => {
                  const grade = normalizeAttemptGrade(a.totalScore, a.maxScore);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-medium text-slate-900">{a.attemptNumber}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                            a.state === 'finished'
                              ? 'bg-emerald-100 text-emerald-700'
                              : a.state === 'in_progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {a.state === 'finished'
                            ? 'Finalizado'
                            : a.state === 'in_progress'
                            ? 'En curso'
                            : 'Abandonado'}
                        </span>
                        {a.needsManualGrading && (
                          <span className="ml-2 text-xs text-amber-600">⚠ manual</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">
                        {new Date(a.startedAt).toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-600">
                        {a.finishedAt ? new Date(a.finishedAt).toLocaleString() : '—'}
                      </td>
                      <td className="p-3 font-medium text-slate-900">
                        {grade !== null ? `${grade.toFixed(1)} / 100` : '—'}
                      </td>
                      <td className="p-3 text-right">
                        {a.state === 'finished' && (
                          <Link
                            href={`/dashboard/courses/${courseId}/quiz/${quizId}/review/${a.id}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Ver revisión
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {finalGrade.finalGrade !== null && finished.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="font-semibold text-emerald-900">Nota final del cuestionario</h3>
          <p className="mt-1 text-3xl font-bold text-emerald-700">
            {finalGrade.finalGrade.toFixed(1)}
            <span className="text-lg text-emerald-600"> / 100</span>
          </p>
          <p className="mt-1 text-sm text-emerald-600">
            Calculada con el método &quot;{METHOD_LABELS[quiz.gradeMethod]}&quot; sobre{' '}
            {finalGrade.attempts} intento(s).
          </p>
        </div>
      )}
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{children}</p>
    </div>
  );
}
