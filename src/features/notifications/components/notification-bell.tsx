'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUnreadCount } from '../actions/notification-actions';

// Campana de notificaciones con badge de contador. Hace polling cada 30s.
export function NotificationBell() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    getUnreadCount()
      .then((res) => {
        if (active && res?.success) setCount(res.count);
      })
      .catch(() => {});

    const interval = setInterval(() => {
      getUnreadCount()
        .then((res) => {
          if (active && res?.success) setCount(res.count);
        })
        .catch(() => {});
    }, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <button
      onClick={() => router.push('/dashboard/notifications')}
      className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#00155C] text-white ring-1 ring-white/20 transition-all hover:bg-[#026BCA] hover:scale-105"
      title="Notificaciones"
      aria-label="Notificaciones"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-slate-950 shadow-sm shadow-cyan-500/50 ring-2 ring-slate-900">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
