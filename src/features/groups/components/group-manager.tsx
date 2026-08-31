'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { getGroups, manageGroup, autoCreateGroups } from '../actions/group-actions';

interface GroupData {
  id: string;
  name: string;
  _count: { members: number };
}

interface GroupManagerProps {
  courseId: string;
}

export function GroupManager({ courseId }: GroupManagerProps) {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [name, setName] = useState('');
  const [groupCount, setGroupCount] = useState(4);
  const [, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await getGroups(courseId);
      if (res.success) {
        setGroups(res.data.map((g) => ({ id: g.id, name: g.name, _count: { members: g._count.members } })));
      }
    });
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  function handleCreate() {
    if (!name.trim()) return;
    startTransition(async () => {
      await manageGroup({ courseId, name });
      setName('');
      load();
    });
  }

  function handleAutoCreate() {
    startTransition(async () => {
      await autoCreateGroups({ courseId, count: groupCount });
      load();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">Crear grupo manual</h3>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del grupo"
            className="flex-1 rounded-lg border border-slate-300 p-2 text-sm"
          />
          <button onClick={handleCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Crear
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">Crear grupos automáticamente</h3>
        <div className="mt-2 flex items-center gap-2">
          <label className="text-sm text-slate-600">Número de grupos:</label>
          <input
            type="number"
            min={1}
            max={20}
            value={groupCount}
            onChange={(e) => setGroupCount(Number(e.target.value))}
            className="w-20 rounded-lg border border-slate-300 p-2 text-sm"
          />
          <button onClick={handleAutoCreate} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            Generar grupos aleatorios
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {groups.map((g) => (
          <div key={g.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
            <span className="font-medium text-slate-900">{g.name}</span>
            <span className="text-xs text-slate-500">{g._count.members} miembros</span>
          </div>
        ))}
      </div>
    </div>
  );
}
