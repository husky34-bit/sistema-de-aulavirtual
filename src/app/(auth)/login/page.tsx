import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "@/features/auth/components/LoginForm";
import { auth } from "@/auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Iniciar sesión · Cognos Virtual",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f4f6f9] flex flex-col justify-between font-poppins relative">
      {/* Halo de fondo decorativo Cognos sutil */}
      <div className="absolute top-0 left-1/2 h-80 w-full max-w-4xl -translate-x-1/2 bg-gradient-to-b from-[#026BCA]/5 to-transparent blur-2xl pointer-events-none" />

      {/* Contenedor central del formulario */}
      <div className="flex-grow flex items-center justify-center p-4 py-8 z-10">
        <div className="w-full max-w-[450px]">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* Footer estilo Moodle Cognos */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-600 z-10">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-slate-500">
            Usted no se ha identificado. (
            <Link href="/" className="text-[#026BCA] hover:underline font-medium">
              Página Principal
            </Link>
            )
          </div>
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <span className="text-[#026BCA] hover:underline cursor-pointer">
              Resumen de retención de datos
            </span>
            <span className="text-slate-300 hidden md:inline">•</span>
            <span className="text-[#026BCA] hover:underline cursor-pointer">
              Descargar la app para dispositivos móviles
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
