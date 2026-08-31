'use client';

import { useState, useTransition } from 'react';
import { saveSetting } from '../actions/admin-actions';

interface Setting {
  key: string;
  value: string;
}

interface SettingsManagerProps {
  settings: Setting[];
}

export function SettingsManager({ settings }: SettingsManagerProps) {
  const [items, setItems] = useState(settings);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [, startTransition] = useTransition();
  const globalMessaging = items.find((item) => item.key === "messaging.sitewide.enabled")?.value === "true";

  function handleSave(key: string, value: string) {
    startTransition(async () => {
      await saveSetting({ key, value });
    });
  }

  function handleAdd() {
    if (!newKey.trim()) return;
    startTransition(async () => {
      await saveSetting({ key: newKey, value: newValue });
      setItems([...items, { key: newKey, value: newValue }]);
      setNewKey('');
      setNewValue('');
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold text-slate-900">Parámetros del sitio</h3>
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <label className="flex cursor-pointer items-start gap-2 text-sm text-amber-950">
            <input
              type="checkbox"
              checked={globalMessaging}
              onChange={(event) => {
                const value = String(event.target.checked);
                const exists = items.some((item) => item.key === "messaging.sitewide.enabled");
                setItems(exists
                  ? items.map((item) => item.key === "messaging.sitewide.enabled" ? { ...item, value } : item)
                  : [...items, { key: "messaging.sitewide.enabled", value }]);
                handleSave("messaging.sitewide.enabled", value);
              }}
            />
            <span><strong>Permitir mensajería global</strong><br /><span className="text-xs">Permite que cualquier usuario pueda iniciar conversaciones, incluso sin curso o contacto compartido.</span></span>
          </label>
        </div>
        <div className="mt-3 space-y-2">
          {items.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <span className="w-48 text-sm font-medium text-slate-700">{s.key}</span>
              <input
                type="text"
                defaultValue={s.value}
                onBlur={(e) => handleSave(s.key, e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 p-2 text-sm"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="clave"
            className="w-48 rounded-lg border border-slate-300 p-2 text-sm"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="valor"
            className="flex-1 rounded-lg border border-slate-300 p-2 text-sm"
          />
          <button onClick={handleAdd} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
}
