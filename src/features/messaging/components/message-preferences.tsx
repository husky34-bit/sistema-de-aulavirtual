"use client";

import { useState, useTransition } from "react";
import { acceptContactRequest, updateMessagePrivacy } from "../actions/messaging-policy-actions";

type ContactRequest = { id: string; name: string | null; role: string };

export function MessagePreferences({ privacy, requests }: { privacy: "CONTACTS" | "COURSES"; requests: ContactRequest[] }) {
  const [value, setValue] = useState(privacy);
  const [isPending, startTransition] = useTransition();
  const save = (nextValue: "CONTACTS" | "COURSES") => startTransition(async () => {
    const result = await updateMessagePrivacy(nextValue);
    if (result.success) setValue(nextValue);
  });
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-[#00155C]">Privacidad de mensajes</h2>
      <p className="mt-1 text-xs text-slate-500">Elige quién puede iniciar una conversación contigo.</p>
      <div className="mt-3 space-y-2">
        <label className="flex cursor-pointer gap-2 rounded-lg p-2 hover:bg-slate-50"><input type="radio" checked={value === "CONTACTS"} disabled={isPending} onChange={() => save("CONTACTS")} /><span className="text-xs"><strong>Solo contactos</strong><br /><span className="text-slate-500">Debes aceptar a la persona primero.</span></span></label>
        <label className="flex cursor-pointer gap-2 rounded-lg p-2 hover:bg-slate-50"><input type="radio" checked={value === "COURSES"} disabled={isPending} onChange={() => save("COURSES")} /><span className="text-xs"><strong>Contactos y personas de mis cursos</strong><br /><span className="text-slate-500">Opción recomendada para Cognos.</span></span></label>
      </div>
      {requests.length > 0 && <div className="mt-4 border-t border-slate-100 pt-3"><p className="text-xs font-bold text-[#00155C]">Solicitudes pendientes</p>{requests.map((request) => <div key={request.id} className="mt-2 flex items-center justify-between gap-2 text-xs"><span>{request.name ?? "Usuario"} · {request.role}</span><button type="button" disabled={isPending} onClick={() => startTransition(async () => { await acceptContactRequest(request.id); })} className="rounded-md bg-[#026BCA] px-2 py-1 font-bold text-white disabled:opacity-50">Aceptar</button></div>)}</div>}
    </aside>
  );
}
