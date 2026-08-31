"use client";

import { useState, useTransition } from "react";
import { changePassword } from "../actions/change-password";
import { CheckCircleIcon } from "@/components/Icons";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("La confirmación de la contraseña no coincide.");
      return;
    }

    startTransition(async () => {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!res.success) {
        setError(res.error);
      } else {
        setSuccess(res.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm font-poppins">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-lg font-bold text-[#00155C]">Seguridad y Contraseña</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Actualiza tu contraseña para mantener tu cuenta protegida.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircleIcon size={16} className="text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Contraseña Actual *
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Introduce tu contraseña actual"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 pr-16 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded"
            >
              {showCurrent ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Nueva Contraseña *
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 pr-16 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded"
            >
              {showNew ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Confirmar Nueva Contraseña *
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la nueva contraseña"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#026BCA] to-[#00BCE4] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#026BCA]/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </div>
      </form>
    </div>
  );
}
