import { requireAuth } from "@/lib/auth-helpers";
import { getBook } from "@/features/books/actions/manage-book";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChapterViewer } from "@/features/books/components/chapter-view";
import { BookIcon } from "@/components/Icons";

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string; bookId: string }>;
}) {
  await requireAuth();
  const { id: courseId, bookId } = await params;

  const result = await getBook(bookId);
  if (!result.success) notFound();
  const book = result.data;

  return (
    <div className="space-y-4">
      <Link href={`/dashboard/courses/${courseId}`} className="text-sm text-slate-500 hover:text-slate-900">
        ← Volver al curso
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><BookIcon size={24} className="text-[#026BCA] shrink-0" /> {book.title}</h1>
      <ChapterViewer
        courseId={courseId}
        chapters={book.chapters.map((c) => ({ id: c.id, title: c.title, content: c.content, position: c.position }))}
      />
    </div>
  );
}
