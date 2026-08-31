'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { pinDiscussion, lockDiscussion } from '../actions/forum-actions';
import { PinIcon, LockIcon } from '@/components/Icons';

interface DiscussionListItem {
  id: string;
  title: string;
  authorName: string;
  postCount: number;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
}

interface DiscussionListProps {
  courseId: string;
  forumId: string;
  discussions: DiscussionListItem[];
  isStaff: boolean;
}

export function DiscussionList({ courseId, forumId, discussions, isStaff }: DiscussionListProps) {
  const [, startTransition] = useTransition();

  if (discussions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No hay discusiones. ¡Inicia la primera!
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <th className="px-4 py-2.5">Discusión</th>
            <th className="px-4 py-2.5">Autor</th>
            <th className="px-4 py-2.5 text-center">Respuestas</th>
            <th className="px-4 py-2.5">Fecha</th>
            {isStaff && <th className="px-4 py-2.5 text-center">Moderación</th>}
          </tr>
        </thead>
        <tbody>
          {discussions.map((d) => (
            <tr key={d.id} className="border-b border-slate-100">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {d.pinned && <span title="Fijada" className="text-[#00155C]"><PinIcon size={14} /></span>}
                  {d.locked && <span title="Cerrada" className="text-slate-500"><LockIcon size={14} /></span>}
                  <Link
                    href={`/dashboard/courses/${courseId}/forum/${forumId}/discussion/${d.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {d.title}
                  </Link>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">{d.authorName}</td>
              <td className="px-4 py-3 text-center text-slate-600">{d.postCount}</td>
              <td className="px-4 py-3 text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</td>
              {isStaff && (
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => startTransition(async () => { await pinDiscussion(d.id, !d.pinned); })}
                    className="text-xs text-slate-600 hover:text-blue-600"
                  >
                    {d.pinned ? 'Desfijar' : 'Fijar'}
                  </button>
                  <span className="mx-1">·</span>
                  <button
                    onClick={() => startTransition(async () => { await lockDiscussion(d.id, !d.locked); })}
                    className="text-xs text-slate-600 hover:text-red-600"
                  >
                    {d.locked ? 'Abrir' : 'Cerrar'}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
