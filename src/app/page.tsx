import Link from "next/link";
import { ZenviaLogo, UserBadge } from "@/components/branding";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { ClockIcon, BarChartIcon, MessageSquareIcon } from "@/components/Icons";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FC]">
      {/* Header en Cognos Azul */}
      <header className="sticky top-0 z-50 w-full border-b border-[#002147] bg-[#00155C]/95 backdrop-blur-md shadow-md">
        <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <ZenviaLogo variant="light" />
          <nav className="flex items-center gap-3 font-poppins">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <UserBadge />
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-gradient-to-r from-[#026BCA] to-[#00BCE4] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[#026BCA]/30 transition-all hover:scale-105 active:scale-95"
                >
                  Ir al Inicio
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-gradient-to-r from-[#026BCA] to-[#00BCE4] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#026BCA]/30 transition-all hover:scale-105 active:scale-95"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section con fondo Cognos Deep Blue */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#00155C] via-[#002147] to-[#0A1A3A] py-24 text-white sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(2,107,202,0.3),rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#00BCE4]/30 bg-[#00BCE4]/10 px-4 py-1 text-xs font-semibold text-[#00BCE4] backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-[#00BCE4] animate-pulse" />
            COGNOS · PLATAFORMA DE APRENDIZAJE VIRTUAL
          </div>
          
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl font-poppins">
            Capacitación Profesional con{" "}
            <span className="bg-gradient-to-r from-[#00BCE4] via-[#10A3CA] to-[#77BF87] bg-clip-text text-transparent">
              Cognos LMS
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl font-normal leading-relaxed">
            Plataforma académica integral para cursos, certificaciones, laboratorios interactivos y evaluación de alto rendimiento.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4 font-poppins">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-gradient-to-r from-[#026BCA] via-[#10A3CA] to-[#00BCE4] px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-[#026BCA]/40 transition-all hover:scale-105 active:scale-95"
              >
                Continuar al Aula Virtual →
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="rounded-xl bg-gradient-to-r from-[#026BCA] via-[#10A3CA] to-[#00BCE4] px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-[#026BCA]/40 transition-all hover:scale-105 active:scale-95"
                >
                  Comenzar ahora →
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
                >
                  Ingresar al Aula Virtual
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Características principales */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#026BCA]">Propuesta de Valor</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#00155C] sm:text-4xl font-poppins">
              Herramientas Diseñadas para tu Éxito Profesional
            </p>
            <div className="mx-auto mt-4 h-1 w-16 bg-[#00155C] rounded-full" />
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 font-poppins">
            <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-8 transition-all duration-200 hover:-translate-y-1 hover:border-[#026BCA] hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00155C] text-white shadow-md shadow-[#00155C]/30">
                <ClockIcon size={24} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#00155C]">Evaluaciones & Quizzes</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal">
                Exámenes cronometrados con autosave continuo, navegación libre/secuencial y revisión detallada de respuestas.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-8 transition-all duration-200 hover:-translate-y-1 hover:border-[#026BCA] hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#026BCA] text-white shadow-md shadow-[#026BCA]/30">
                <BarChartIcon size={24} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#00155C]">Libro de Calificaciones</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal">
                Agregaciones ponderadas, cálculo en cascada, protección estricta de overrides manuales y exportación en CSV.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-8 transition-all duration-200 hover:-translate-y-1 hover:border-[#026BCA] hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10A3CA] text-white shadow-md shadow-[#10A3CA]/30">
                <MessageSquareIcon size={24} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#00155C]">Interacción & Recursos</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal">
                Foros recursivos y modo Q&A, mensajería instantánea 1:1, libros con capítulos y seguimiento de finalización.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Oficial Cognos */}
      <footer className="border-t border-white/10 bg-[#00155C] py-12 text-white font-poppins">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <ZenviaLogo variant="light" />
          <div className="text-center sm:text-right text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-white">COGNOS CAPACITACIÓN</p>
            <p>© {new Date().getFullYear()} Grupo Cognos. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


