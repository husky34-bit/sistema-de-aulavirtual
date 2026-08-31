'use client';

import { useState, useEffect } from 'react';
import { getConversations } from '../actions/messaging-actions';
import Link from 'next/link';

interface ConversationItem {
  id: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  courseTitle: string | null;
}

interface ConversationListProps {
  activeConversationId?: string;
}

export function ConversationList({ activeConversationId }: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  useEffect(() => {
    let active = true;
    getConversations().then((res) => {
      if (active && res.success) setConversations(res.data);
    });
    return () => {
      active = false;
    };
  }, []);

  if (conversations.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No tienes conversaciones.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((c) => (
        <Link
          key={c.id}
          href={`/dashboard/messages/${c.id}`}
          className={`block rounded-lg p-3 transition hover:bg-slate-50 ${
            c.id === activeConversationId ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-900">{c.otherUserName}</span>
            {c.unreadCount > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                {c.unreadCount}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">{c.lastMessage}</p>
          {c.courseTitle && <p className="mt-1 truncate text-[11px] font-medium text-[#026BCA]">Curso: {c.courseTitle}</p>}
        </Link>
      ))}
    </div>
  );
}
