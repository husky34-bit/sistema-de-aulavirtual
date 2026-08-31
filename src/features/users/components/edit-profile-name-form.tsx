"use client";

import { useState, useTransition } from "react";
import { updateProfileName } from "../actions/update-profile";
import { CheckCircleIcon } from "@/components/Icons";
import { useRouter } from "next/navigation";

export function EditProfileNameForm({
  initialName,
  email,
  roleLabel,
}: {
  initialName: string;
  email: string;
  roleLabel: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    startTransition(async () => {
      const res = await updateProfileName({ name });
      if (!res.success) {
        setError(res.error);
      } else {
        setSuccess(res.message);
        setIsEditing(false);
        router.refresh();
      }
    });
  };

  const handleCancel = () => {
    setName(initialName);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm font-poppins">
      <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#00155C]">Información Personal</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulta y actualiza los datos visibles en tu cuenta de aprendizaje.
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setSuccess(null);
              setError(null);
            }}
            className="rounded-xl border border-[#026BCA] bg-[#EDF6FF] px-4 py-2 text-xs font-bold text-[#026BCA] transition hover:bg-[#026BCA] hover:text-white"
          >
            ✏️ Editar Nombre
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircleIcon size={16} className="text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Correo Electrónico (Solo lectura)
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#026BCA] to-[#00BCE4] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#026BCA]/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl text-xs">
          <div className="space-y-1">
            <p className="font-semibold text-slate-400 uppercase tracking-wider">Nombre Completo</p>
            <p className="text-base font-bold text-slate-800">{name}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-400 uppercase tracking-wider">Correo Electrónico</p>
            <p className="text-base font-medium text-slate-700">{email}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-400 uppercase tracking-wider">Tipo de Cuenta</p>
            <p className="text-sm font-bold text-[#00155C]">{roleLabel}</p>
          </div>
        </div>
      )}
    </div>
  );
}
