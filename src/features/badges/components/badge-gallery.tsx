'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { getUserBadges } from '../actions/badge-actions';
import { AwardIcon } from '@/components/Icons';

interface BadgeData {
  id: string;
  badge: { id: string; name: string; description: string | null; imageUrl: string | null };
  awardedAt: string;
}

// Galería de insignias del usuario.
export function BadgeGallery() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await getUserBadges();
      if (res.success) {
        setBadges(res.data.map((a) => ({
          id: a.id,
          badge: a.badge,
          awardedAt: a.awardedAt.toISOString(),
        })));
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (badges.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Aún no tienes insignias. ¡Completa actividades para ganarlas!
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {badges.map((b) => (
        <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
            {b.badge.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={b.badge.imageUrl} alt={b.badge.name} className="h-16 w-16 rounded-full" />
            ) : (
              <AwardIcon size={32} className="text-amber-500" />
            )}
          </div>
          <h3 className="mt-2 font-medium text-slate-900">{b.badge.name}</h3>
          {b.badge.description && <p className="mt-1 text-xs text-slate-500">{b.badge.description}</p>}
          <p className="mt-2 text-xs text-slate-400">
            Otorgada el {new Date(b.awardedAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
