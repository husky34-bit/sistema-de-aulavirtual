'use client';

import { useState, useTransition } from 'react';
import { replyPost, deletePost } from '../actions/forum-actions';

interface PostData {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  editedAt?: string | null;
  parentId?: string | null;
  replies?: PostData[];
}

interface PostThreadProps {
  posts: PostData[];
  discussionId: string;
  currentUserId: string;
  isStaff: boolean;
  locked: boolean;
  isQnaHidden?: boolean;
}

// Renderizado RECURSIVO de respuestas anidadas.
function PostNode({
  post,
  discussionId,
  currentUserId,
  isStaff,
  locked,
  depth,
}: {
  post: PostData;
  discussionId: string;
  currentUserId: string;
  isStaff: boolean;
  locked: boolean;
  depth: number;
}) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [, startTransition] = useTransition();

  const canEdit = post.authorId === currentUserId || isStaff;

  function handleReply() {
    if (!replyText.trim()) return;
    startTransition(async () => {
      await replyPost({ discussionId, parentId: post.id, content: replyText });
      setReplyText('');
      setReplying(false);
    });
  }

  function handleDelete() {
    if (!confirm('¿Eliminar este mensaje?')) return;
    startTransition(async () => {
      await deletePost(post.id);
    });
  }

  return (
    <div className={`border-l-2 border-slate-200 pl-4 ${depth > 0 ? 'ml-4' : ''}`} style={{ marginLeft: depth * 8 }}>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-900">{post.authorName}</span>
          <span className="text-xs text-slate-400">
            {new Date(post.createdAt).toLocaleString()}
            {post.editedAt && ' (editado)'}
          </span>
        </div>
        <div className="mt-2 text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="mt-2 flex gap-2 text-xs">
          {!locked && (
            <button
              onClick={() => setReplying((r) => !r)}
              className="text-blue-600 hover:underline"
            >
              Responder
            </button>
          )}
          {canEdit && !locked && (
            <button onClick={handleDelete} className="text-red-600 hover:underline">
              Eliminar
            </button>
          )}
        </div>

        {replying && (
          <div className="mt-3 space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm"
              placeholder="Escribe tu respuesta…"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReply}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Enviar
              </button>
              <button
                onClick={() => setReplying(false)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {post.replies && post.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {post.replies.map((reply) => (
            <PostNode
              key={reply.id}
              post={reply}
              discussionId={discussionId}
              currentUserId={currentUserId}
              isStaff={isStaff}
              locked={locked}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Construye el árbol de posts a partir de la lista plana (con parentId).
function buildTree(posts: PostData[]): PostData[] {
  const map = new Map<string, PostData>();
  const roots: PostData[] = [];

  // Primera pasada: crear nodos con replies vacíos
  for (const p of posts) {
    map.set(p.id, { ...p, replies: [] });
  }

  // Segunda pasada: asignar hijos a padres
  for (const p of posts) {
    const node = map.get(p.id)!;
    if (p.parentId) {
      const parent = map.get(p.parentId);
      if (parent) {
        parent.replies!.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function PostThread({ posts, discussionId, currentUserId, isStaff, locked, isQnaHidden }: PostThreadProps) {
  const [newPostText, setNewPostText] = useState('');
  const [, startTransition] = useTransition();

  function handleNewPost() {
    if (!newPostText.trim()) return;
    startTransition(async () => {
      await replyPost({ discussionId, content: newPostText });
      setNewPostText('');
    });
  }

  if (isQnaHidden) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Este foro es de tipo Pregunta y Respuesta. Debes publicar tu respuesta antes de ver las de otros.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {buildTree(posts).map((post) => (
        <PostNode
          key={post.id}
          post={post}
          discussionId={discussionId}
          currentUserId={currentUserId}
          isStaff={isStaff}
          locked={locked}
          depth={0}
        />
      ))}

      {!locked && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm"
            placeholder="Escribe una nueva respuesta…"
          />
          <button
            onClick={handleNewPost}
            className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Publicar respuesta
          </button>
        </div>
      )}
    </div>
  );
}
