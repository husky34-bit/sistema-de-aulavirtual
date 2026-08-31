'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { createApiToken, revokeApiToken, getApiTokens } from '../actions/token-actions';

export function TokenManager() {
  const [tokens, setTokens] = useState<{ id: string; name: string; scopes: string[]; revokedAt: string | null; createdAt: string }[]>([]);
  const [name, setName] = useState('');
  const [newToken, setNewToken] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await getApiTokens();
      if (res.success) {
        setTokens(res.data.map((t) => ({
          id: t.id,
          name: t.name,
          scopes: t.scopes,
          revokedAt: t.revokedAt?.toISOString() ?? null,
          createdAt: t.createdAt.toISOString(),
        })));
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setNewToken(null);
    startTransition(async () => {
      const res = await createApiToken({ name, scopes: ['courses', 'users', 'enrolments', 'grades', 'completion'] });
      if (res.success) {
        setNewToken(res.token);
        setName('');
        load();
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">Crear nuevo token</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del token (ej. Integración Moodle)"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#101d31] p-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Generar token
        </button>
      </form>

      {newToken && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-4">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Token generado (cópialo ahora, no se mostrará de nuevo):</p>
          <code className="mt-2 block break-all rounded bg-white dark:bg-[#0c182b] p-2 text-xs text-slate-900 dark:text-slate-100">{newToken}</code>
        </div>
      )}

      <div className="space-y-2">
        {tokens.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
            <div>
              <span className="font-medium text-slate-900">{t.name}</span>
              <span className="ml-2 text-xs text-slate-400">{t.scopes.join(', ')}</span>
              {t.revokedAt && <span className="ml-2 text-xs text-red-600">Revocado</span>}
            </div>
            {!t.revokedAt && (
              <button
                onClick={() => startTransition(async () => { await revokeApiToken(t.id); load(); })}
                className="text-xs text-red-600 hover:underline"
              >
                Revocar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
