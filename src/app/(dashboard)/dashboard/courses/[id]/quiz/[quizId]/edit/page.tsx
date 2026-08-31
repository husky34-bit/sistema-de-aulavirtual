import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { getQuizById } from '@/features/quizzes/actions/get-quiz-by-id';
import { getQuestions } from '@/features/questions/actions/get-questions';
import { QuizQuestionsEditor } from '@/features/quizzes/components/quiz-questions-editor';

export default async function QuizEditPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);
  const { id: courseId, quizId } = await params;

  const quiz = await getQuizById(quizId);
  if (!quiz || quiz.course.id !== courseId) notFound();
  if (quiz.course.instructorId !== user.id && user.role !== 'ADMIN') {
    notFound();
  }

  const available = await getQuestions(courseId);

  const rows = quiz.questions.map((q) => ({
    id: q.id,
    position: q.position,
    score: q.score,
    question: { id: q.question.id, name: q.question.name },
    questionVersion: q.questionVersion
      ? { id: q.questionVersion.id, type: q.questionVersion.type, text: q.questionVersion.text }
      : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/courses/${courseId}/quiz/${quizId}`}
          className="text-xs text-blue-600 hover:underline"
        >
          ← Volver a la portada del quiz
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Editar: {quiz.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Añade preguntas del banco, ajusta puntajes y el orden, luego publica.
        </p>
      </div>

      <QuizQuestionsEditor
        quizId={quizId}
        courseId={courseId}
        quiz={{
          title: quiz.title,
          description: quiz.description,
          timeLimitMin: quiz.timeLimitMin,
          maxAttempts: quiz.maxAttempts,
          gradeMethod: quiz.gradeMethod,
          password: quiz.password,
          published: quiz.published,
        }}
        questions={rows}
        available={available.map((q) => ({
          id: q.id,
          name: q.name,
          currentVersion: q.currentVersion
            ? { type: q.currentVersion.type, text: q.currentVersion.text }
            : null,
        }))}
      />
    </div>
  );
}
