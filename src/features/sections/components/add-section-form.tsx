"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSection } from "../actions/manage-section";

export function AddSectionForm({ courseId }: { courseId: string }) {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      const result = await createSection(courseId, title.trim());
      if (result.success) {
        setTitle("");
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nueva sección..."
        className="flex-1 rounded border border-slate-300 p-2"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
      >
        Agregar
      </button>
    </form>
  );
}
