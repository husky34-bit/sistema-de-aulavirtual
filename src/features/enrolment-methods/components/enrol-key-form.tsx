"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { selfEnrol } from "../actions/self-enrol";

export function EnrolKeyForm({ courseId }: { courseId: string }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await selfEnrol(courseId, key);
      if (result.success) {
        router.push(`/dashboard/courses/${courseId}`);
        router.refresh();
      } else {
        setError(result.error ?? "Error al inscribirse");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-semibold text-slate-900">
        Inscribirse en este curso
      </h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Clave de acceso"
        className="w-full rounded border border-slate-300 p-2"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-indigo-600 p-2 text-white disabled:opacity-50"
      >
        {isPending ? "Verificando..." : "Inscribirme"}
      </button>
    </form>
  );
}
