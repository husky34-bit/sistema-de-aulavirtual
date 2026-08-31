'use client';

import { useState, useTransition } from 'react';
import { sendMessage } from '../actions/messaging-actions';

interface NewMessageFormProps {
  currentUserId: string;
}

export function NewMessageForm({ currentUserId }: NewMessageFormProps) {
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  void currentUserId;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await sendMessage(recipient, content);
      setError(res.error ?? 'Inicia la conversación desde Participantes del curso.');
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Destinatario (ID de usuario)</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          placeholder="ID del usuario"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Mensaje</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Enviar
      </button>
    </form>
  );
}
