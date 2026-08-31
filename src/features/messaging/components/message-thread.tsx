'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { getMessages, sendMessageToConversation, markRead } from '../actions/messaging-actions';

interface MessageData {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
}

export function MessageThread({ conversationId, currentUserId }: MessageThreadProps) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [text, setText] = useState('');
  const [, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await getMessages(conversationId);
      if (res.success) {
        setMessages(res.data.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.sender.name ?? 'Anónimo',
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })));
        await markRead(conversationId);
      }
    });
  }, [conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    startTransition(async () => {
      await sendMessageToConversation(conversationId, text);
      setText('');
      load();
    });
  }

  return (
    <div className="flex h-[500px] flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                m.senderId === currentUserId
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
              }`}
            >
              {m.senderId !== currentUserId && (
                <p className="mb-0.5 text-xs font-medium opacity-70">{m.senderName}</p>
              )}
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-200 dark:border-slate-800 p-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#101d31] p-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          placeholder="Escribe un mensaje…"
        />
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Enviar
        </button>
      </form>
    </div>
  );
}
