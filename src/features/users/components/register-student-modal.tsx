"use client";

import { useState, useTransition } from "react";
import { createStudent } from "../actions/create-student";
import { PlusIcon, CheckCircleIcon, UsersIcon } from "@/components/Icons";

export function RegisterStudentModal({
  courseId,
  courseTitle,
  onStudentRegistered,
}: {
  courseId?: string;
  courseTitle?: string;
  onStudentRegistered?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    name: string | null;
    email: string;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let gen = "";
    for (let i = 0; i < 8; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Por favor ingresa el nombre del estudiante.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    startTransition(async () => {
      const res = await createStudent({
        name,
        email,
        password,
        courseId,
      });

      if (!res.success) {
        setError(res.error);
      } else {
        setSuccessData({
          name: res.user.name,
          email: res.user.email,
          message: res.message,
        });
        if (onStudentRegistered) {
          onStudentRegistered();
        }
      }
    });
  };

  const handleCopyCredentials = () => {
    const text = `Acceso al Aula Virtual Cognos:\n• Correo: ${email}\n• Contraseña: ${password}\n• Enlace: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
    setSuccessData(null);
    setCopied(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#026BCA] to-[#00BCE4] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#026BCA]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer font-poppins"
      >
        <PlusIcon size={16} />
        <span>Registrar nuevo alumno</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-white p-6 md:p-8 shadow-2xl font-poppins text-slate-800">
            {/* Header del Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00155C] text-white shadow-md shadow-[#00155C]/30">
                  <UsersIcon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#00155C]">
                    Registrar Nuevo Estudiante
                  </h3>
                  <p className="text-xs text-slate-500">
                    {courseTitle
                      ? `Inscribir directamente en ${courseTitle}`
                      : "Crear cuenta de estudiante y asignar contraseña"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            {successData ? (
              /* Vista de éxito */
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <CheckCircleIcon size={18} className="text-emerald-600" />
                    <span>{successData.message}</span>
                  </div>
                  <p className="mt-2 text-xs text-emerald-700">
                    El alumno ya puede ingresar al aula virtual con las siguientes credenciales:
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Nombre:</span>
                    <span className="font-bold text-slate-800">{successData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Correo:</span>
                    <span className="font-mono font-bold text-slate-800">{successData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Contraseña asignada:</span>
                    <span className="font-mono font-bold text-[#026BCA] bg-white px-2 py-0.5 rounded border border-slate-200">
                      {password}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  * El estudiante podrá cambiar esta contraseña en cualquier momento desde su perfil de usuario.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="flex-1 rounded-xl border border-[#026BCA] bg-[#EDF6FF] px-4 py-2.5 text-xs font-bold text-[#026BCA] transition hover:bg-[#026BCA] hover:text-white"
                  >
                    {copied ? "✓ ¡Credenciales copiadas!" : "📋 Copiar credenciales para enviar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-xl bg-[#00155C] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#002147]"
                  >
                    Listo
                  </button>
                </div>
              </div>
            ) : (
              /* Formulario de registro */
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nombre completo del estudiante *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza Ramos"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="estudiante@correo.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Contraseña inicial asignada *
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] font-bold text-[#026BCA] hover:underline"
                    >
                      ⚡ Generar aleatoria
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 pr-16 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded"
                    >
                      {showPassword ? "Ocultar" : "Ver"}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Proporciónale esta contraseña al estudiante para su primer inicio de sesión.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#026BCA] to-[#00BCE4] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#026BCA]/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {isPending ? "Registrando..." : "Registrar y Matricular"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
