import { requireRole } from '@/lib/auth-helpers';
import { getQuestions } from '@/features/questions/actions/get-questions';
import { getQuestionCategories } from '@/features/questions/actions/get-question-categories';
import { QuestionActions } from '@/features/questions/components/question-actions';
import { CategoryManager } from '@/features/questions/components/category-manager';
import Link from 'next/link';

const TYPE_LABELS: Record<string, string> = {
  multichoice: 'Opción múltiple',
  truefalse: 'Verdadero/Falso',
  shortanswer: 'Respuesta corta',
  numerical: 'Numérica',
  calculated: 'Calculada',
  essay: 'Ensayo',
  match: 'Emparejamiento',
  ordering: 'Ordenamiento',
  ddimageortext: 'Arrastrar texto a imagen',
  ddmarker: 'Arrastrar marcadores',
  ddwtos: 'Arrastrar texto sobre imagen',
  gapselect: 'Selección en huecos',
  multianswer: 'Respuestas anidadas (cloze)',
  description: 'Descripción',
};

export default async function QuestionBankPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const { id } = await params;
  const { category } = await searchParams;

  const [questions, categories] = await Promise.all([
    getQuestions(id, category),
    getQuestionCategories(id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/courses/${id}`}
              className="text-xs text-blue-600 hover:underline"
            >
              ← Volver al curso
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Banco de preguntas</h1>
        </div>
        <div className="flex items-center gap-3">
          <CategoryManager courseId={id} />
          {categories.length > 0 ? (
            <Link
              href={`/dashboard/courses/${id}/questions/new`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              + Nueva pregunta
            </Link>
          ) : (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              Crea una categoría primero
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-400 mr-1">Categorías:</span>
        <Link
          href={`/dashboard/courses/${id}/questions`}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            !category
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Todas ({questions.length})
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/dashboard/courses/${id}/questions?category=${cat.id}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              category === cat.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat.name} ({cat._count.questions})
          </Link>
        ))}
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500 text-sm">
            No hay preguntas en este banco. Crea una categoría y luego añade tu primera pregunta con &quot;Nueva pregunta&quot;.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-3">Nombre</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Enunciado</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Versión</th>
                <th className="p-3">Puntaje</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-900">{q.name}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
                      {TYPE_LABELS[q.currentVersion?.type ?? ''] ?? q.currentVersion?.type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 max-w-xs truncate" title={q.currentVersion?.text}>
                    {q.currentVersion?.text}
                  </td>
                  <td className="p-3 text-xs text-slate-500">{q.category.name}</td>
                  <td className="p-3 text-xs text-slate-500 font-mono">
                    v{q.currentVersion?.version ?? 1}
                  </td>
                  <td className="p-3 text-slate-700 font-medium">{q.currentVersion?.defaultScore} pts</td>
                  <td className="p-3 text-right">
                    <QuestionActions
                      questionId={q.id}
                      questionName={q.name}
                      questionText={q.currentVersion?.text ?? ''}
                      defaultScore={q.currentVersion?.defaultScore ?? 1}
                      questionData={q.currentVersion?.data}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
