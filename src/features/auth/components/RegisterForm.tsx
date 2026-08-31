"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/features/auth/actions/register";

export default function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Nombre Completo
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Juan Pérez"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#026BCA]/15 transition"
        />
        {state?.errors?.name && (
          <p className="text-xs font-medium text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Correo Electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@cognos.edu.bo"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#026BCA]/15 transition"
        />
        {state?.errors?.email && (
          <p className="text-xs font-medium text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#026BCA]/15 transition"
        />
        {state?.errors?.password && (
          <p className="text-xs font-medium text-red-600">{state.errors.password[0]}</p>
        )}
      </div>

      {state?.message && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#00155C] hover:bg-[#026BCA] py-3 text-sm font-bold text-white shadow-lg shadow-[#00155C]/25 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {pending ? "Creando cuenta…" : "Registrarme en Cognos LMS"}
      </button>

      <div className="mt-2 text-center text-xs text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-bold text-[#026BCA] hover:underline">
          Inicia sesión
        </Link>
      </div>
    </form>
  );
}

