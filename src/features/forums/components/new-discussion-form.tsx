'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createDiscussion } from '../actions/forum-actions';

interface NewDiscussionFormProps {
  forumId: string;
  courseId: string;
}

export function NewDiscussionForm({ forumId, courseId }: NewDiscussionFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createDiscussion({ forumId, title, content });
      if (!res.success) {
        setError(('error' in res && typeof res.error === 'string') ? res.error : 'Error al crear la discusión');
        return;
      }
      router.push(`/dashboard/courses/${courseId}/forum/${forumId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Mensaje</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Crear discusión
      </button>
    </form>
  );
}
