"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MessageSquareIcon, UsersIcon } from "@/components/Icons";
import { requestContact, startCourseConversation } from "../actions/messaging-policy-actions";
import { RegisterStudentModal } from "@/features/users/components/register-student-modal";

type Participant = { id: string; name: string | null; image: string | null; role: string; canMessage: boolean };

export function CourseParticipants({
  courseId,
  courseTitle,
  people,
  canEnroll = false,
}: {
  courseId: string;
  courseTitle: string;
  people: Participant[];
  canEnroll?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const contact = (recipientId: string) => startTransition(async () => {
    const result = await requestContact(courseId, recipientId);
    setMessage(result.success ? "Solicitud de contacto enviada." : result.error);
  });

  const openConversation = (recipientId: string) => startTransition(async () => {
    const result = await startCourseConversation(courseId, recipientId);
    if (result.success) router.push(`/dashboard/messages/${result.conversationId}`);
    else setMessage(result.error);
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF6FF] text-[#026BCA] shrink-0">
            <UsersIcon size={20} />
          </span>
          <div>
            <h2 className="font-bold text-[#00155C]">Participantes del Curso</h2>
            <p className="text-xs text-slate-500">Personas matriculadas en {courseTitle}.</p>
          </div>
        </div>

        {canEnroll && (
          <RegisterStudentModal
            courseId={courseId}
            courseTitle={courseTitle}
            onStudentRegistered={() => router.refresh()}
          />
        )}
      </div>
      {message && <p className="mt-3 rounded-lg bg-[#EDF6FF] px-3 py-2 text-xs font-medium text-[#00155C]">{message}</p>}
      <ul className="divide-y divide-slate-100">
        {people.map((person) => (
          <li key={person.id} className="flex flex-wrap items-center gap-3 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00155C] text-xs font-bold text-white">{(person.name ?? "U")[0].toUpperCase()}</span>
            <div className="min-w-32 flex-1">
              <p className="text-sm font-semibold text-slate-900">{person.name ?? "Usuario"}</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{person.role === "TEACHER" ? "Docente" : "Compañero/a"}</p>
            </div>
            {person.canMessage ? (
              <button type="button" disabled={isPending} onClick={() => openConversation(person.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#00155C] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#026BCA] disabled:opacity-50"><MessageSquareIcon size={14} /> Mensaje</button>
            ) : (
              <button type="button" disabled={isPending} onClick={() => contact(person.id)} className="rounded-lg border border-[#026BCA]/30 px-3 py-2 text-xs font-bold text-[#026BCA] transition hover:bg-[#EDF6FF] disabled:opacity-50">Solicitar contacto</button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
