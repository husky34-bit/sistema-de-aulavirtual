'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUnreadMessagesCount } from '../actions/messaging-actions';

export function MessageBell() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    getUnreadMessagesCount().then((res) => {
      if (active && res.success) setCount(res.count);
    });

    const interval = setInterval(() => {
      getUnreadMessagesCount().then((res) => {
        if (active && res.success) setCount(res.count);
      });
    }, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => router.push('/dashboard/messages')}
      className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#00155C] text-white ring-1 ring-white/20 transition-all hover:bg-[#026BCA] hover:scale-105"
      title="Mensajes directos"
      aria-label="Mensajes"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00BCE4] px-1 text-[10px] font-bold text-slate-950 shadow-xs ring-2 ring-[#00155C]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
