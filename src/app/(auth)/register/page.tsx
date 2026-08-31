import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { auth } from "@/auth";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Crear Cuenta · Cognos Virtual",
};

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f4f6f9] flex flex-col justify-between font-poppins relative">
      <div className="flex-grow flex items-center justify-center p-4 py-8 z-10">
        <div className="w-full max-w-[450px]">
          <div className="bg-white rounded-[16px] shadow-2xl border border-slate-200/80 w-full overflow-hidden">
            <div className="bg-[#f8f9fa] border-b border-slate-200 px-6 py-4 text-center">
              <h2 className="text-slate-800 font-semibold text-xs sm:text-sm">
                Registro de Nuevo Estudiante
              </h2>
            </div>

            <div className="p-6 sm:p-8">
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

              <RegisterForm />
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-600 z-10">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-slate-500">
            ¿Ya tienes cuenta? (
            <Link href="/login" className="text-[#026BCA] hover:underline font-medium">
              Iniciar sesión
            </Link>
            )
          </div>
        </div>
      </footer>
    </main>
  );
}
