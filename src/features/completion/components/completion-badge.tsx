'use client';

import { useState, useEffect } from 'react';
import { checkCompletion } from '../actions/completion-actions';
import type { ActivityType } from '../services/completion-engine';

interface CompletionBadgeProps {
  userId: string;
  activityType: ActivityType;
  activityId: string;
}

// Badge ✓ verde junto a cada actividad si está completada.
export function CompletionBadge({ userId, activityType, activityId }: CompletionBadgeProps) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    checkCompletion(userId, activityType, activityId).then((completed) => {
      if (active) setDone(completed);
    });
    return () => {
      active = false;
    };
  }, [userId, activityType, activityId]);

  if (done) {
    return <span className="text-emerald-600" title="Completado">✓</span>;
  }
  return <span className="text-slate-300" title="No completado">○</span>;
}
