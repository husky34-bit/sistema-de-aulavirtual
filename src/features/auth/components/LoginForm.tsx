"use client";

import { useState, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { login } from "@/features/auth/actions/login";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [lang, setLang] = useState("es");

  // Función para autocompletar e ingresar rápidamente con cuenta de invitado/estudiante
  const handleGuestLogin = (demoRole: "student" | "teacher") => {
    if (demoRole === "student") {
      setEmail("student@zenvia.lms");
      setPassword("Password1!");
    } else {
      setEmail("teacher@zenvia.lms");
      setPassword("Password1!");
    }
  };

  return (
    <div className="w-full font-poppins">
      {/* Login Card */}
      <div className="bg-white rounded-[16px] shadow-2xl border border-slate-200/80 w-full overflow-hidden">
        
        {/* Top Info Banner (Estilo Moodle Cognos) */}
        <div className="bg-[#f8f9fa] border-b border-slate-200 px-6 py-4 text-center">
          <h2 className="text-slate-800 font-semibold text-xs sm:text-sm">
            ¿Desea acceder ahora con una cuenta de usuario completa?
          </h2>
        </div>

        <div className="p-6 sm:p-8">
          {/* Logo Cognos Virtual */}
          <div className="flex flex-col items-center justify-center mb-6">
            <Image
              src="/images/logos/LG.webp"
              alt="COGNOS VIRTUAL"
              width={180}
              height={48}
              className="h-10 sm:h-12 w-auto object-contain"
              priority
            />
            <span className="mt-1 text-[11px] font-extrabold uppercase tracking-widest text-[#026BCA]">
              AULA VIRTUAL
            </span>
          </div>

          {/* Formulario de Login */}
          <form action={action} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            <div>
              <input
                id="email"
                type="text"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nombre de usuario o correo"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#026BCA] focus:ring-2 focus:ring-[#026BCA]/20 transition"
              />
              {state?.errors?.email && (
                <p className="mt-1 text-xs font-medium text-red-600">{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <input
                id="password"
                type="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#026BCA] focus:ring-2 focus:ring-[#026BCA]/20 transition"
              />
              {state?.errors?.password && (
                <p className="mt-1 text-xs font-medium text-red-600">{state.errors.password[0]}</p>
              )}
            </div>

            {state?.message && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                {state.message}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-[#026BCA] hover:bg-[#00155C] text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md shadow-[#026BCA]/25 active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm"
            >
              {pending ? "Comprobando acceso…" : "Acceder"}
            </button>

            <div className="text-left mt-2 flex items-center justify-between text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[#026BCA] hover:underline font-medium cursor-pointer"
              >
                ¿Olvidó su contraseña?
              </button>

              <Link href="/register" className="text-slate-500 hover:text-[#00155C] font-semibold">
                Registrarse
              </Link>
            </div>
          </form>

          <div className="my-6 border-t border-slate-200"></div>

          {/* Acceso de Invitado / Cuentas de Demostración */}
          <div className="text-center">
            <h3 className="text-slate-700 font-semibold text-xs sm:text-sm mb-3">
              Algunos cursos permiten el acceso de invitados
            </h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleGuestLogin("student")}
                className="bg-[#eceeef] hover:bg-[#dfe2e5] text-[#373a3c] font-semibold py-2.5 px-4 rounded-lg transition-colors border border-slate-300 w-full text-xs sm:text-sm cursor-pointer"
              >
                Entrar como persona invitada (Estudiante Demo)
              </button>
            </div>
          </div>

          <div className="my-6 border-t border-slate-200"></div>

          {/* Idioma y Aviso de Cookies */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm">
            <div className="w-full sm:w-auto">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full sm:w-auto bg-transparent border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700 outline-none text-xs focus:border-[#026BCA]"
              >
                <option value="es">Español - Internacional (es)</option>
                <option value="en">English (en)</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowCookieModal(true)}
              className="text-[#026BCA] hover:underline text-xs bg-[#eceeef] hover:bg-[#dfe2e5] border border-slate-300 rounded-lg px-3 py-1.5 font-medium transition cursor-pointer"
            >
              Aviso de Cookies
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Olvido de contraseña */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-[#00155C]">Recuperación de Contraseña</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Si olvidaste tu contraseña o necesitas restablecer tus credenciales de acceso, ponte en contacto con tu <strong>Asesor Académico de Cognos</strong> o solicita a tu docente que actualice tu clave temporal.
            </p>
            <div className="mt-4 rounded-xl bg-[#EDF6FF] p-3 text-xs text-[#00155C]">
              <strong>Soporte Cognos:</strong> soporte@cognos.edu.bo
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="rounded-xl bg-[#00155C] px-4 py-2 text-xs font-bold text-white hover:bg-[#026BCA] transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Aviso de Cookies */}
      {showCookieModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-[#00155C]">Aviso de Cookies y Sesión</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              El Aula Virtual de Cognos utiliza cookies técnicas estrictamente necesarias para autenticar su sesión de usuario y garantizar la seguridad de sus evaluaciones y calificaciones.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCookieModal(false)}
                className="rounded-xl bg-[#00155C] px-4 py-2 text-xs font-bold text-white hover:bg-[#026BCA] transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
