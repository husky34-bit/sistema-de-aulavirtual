'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { getComments, addComment, deleteComment } from '../actions/comment-actions';

interface CommentData {
  id: string;
  authorName: string;
  authorId: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  contextType: string;
  contextId: string;
  currentUserId: string;
  isStaff?: boolean;
}

// Componente reutilizable de comentarios. Recibe contextType + contextId.
export function CommentSection({ contextType, contextId, currentUserId, isStaff = false }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [text, setText] = useState('');
  const [, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await getComments(contextType, contextId);
      if (res.success) {
        setComments(res.data.map((c) => ({
          id: c.id,
          authorName: c.author.name ?? 'Anónimo',
          authorId: c.authorId,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
        })));
      }
    });
  }, [contextType, contextId]);

  useEffect(() => {
    load();
  }, [load]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    startTransition(async () => {
      await addComment({ contextType, contextId, content: text });
      setText('');
      load();
    });
  }

  function handleDelete(commentId: string) {
    if (!confirm('¿Eliminar comentario?')) return;
    startTransition(async () => {
      await deleteComment(commentId);
      load();
    });
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-900">Comentarios</h4>
      {comments.map((c) => (
        <div key={c.id} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-900">{c.authorName}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
              {(c.authorId === currentUserId || isStaff) && (
                <button onClick={() => handleDelete(c.id)} className="text-xs text-red-600 hover:underline">
                  Eliminar
                </button>
              )}
            </div>
          </div>
          <div className="mt-1 text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: c.content }} />
        </div>
      ))}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 p-2 text-sm"
          placeholder="Escribe un comentario…"
        />
        <button type="submit" className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Comentar
        </button>
      </form>
    </div>
  );
}
