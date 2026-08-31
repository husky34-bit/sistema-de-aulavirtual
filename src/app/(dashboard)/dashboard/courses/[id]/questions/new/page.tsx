import { requireRole } from '@/lib/auth-helpers';
import { getQuestionCategories } from '@/features/questions/actions/get-question-categories';
import { NewQuestionForm } from '@/features/questions/components/new-question-form';
import Link from 'next/link';

export default async function NewQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const { id } = await params;
  const categories = await getQuestionCategories(id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/dashboard/courses/${id}/questions`}
          className="text-xs text-blue-600 hover:underline"
        >
          ← Volver al banco de preguntas
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Nueva pregunta</h1>
      </div>
      <NewQuestionForm courseId={id} categories={categories} />
    </div>
  );
}
