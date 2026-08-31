import Link from "next/link";
import { verifyCertificate } from "@/features/certificates/actions/certificate-actions";
import { AwardIcon, CheckCircleIcon, XCircleIcon, ShieldIcon, SchoolIcon, GraduationCapIcon } from "@/components/Icons";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const certCode = decodeURIComponent(id).toUpperCase();
  const result = await verifyCertificate(certCode);

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-poppins text-slate-800 flex flex-col justify-between">
      {/* Public Top Header */}
      <header className="border-b border-[#002147] bg-[#00155C] text-white py-4 shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <GraduationCapIcon size={24} className="text-[#00BCE4]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none font-serif">
                GRUPO COGNOS
              </span>
              <span className="text-[10px] text-[#00BCE4] font-medium tracking-wider uppercase">
                Portal Oficial de Validación
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition backdrop-blur-sm"
            >
              Acceso a Aula Virtual
            </Link>
          </div>
        </div>
      </header>

      {/* Main Validation Container */}
      <main className="mx-auto max-w-3xl w-full px-4 py-12 sm:px-6 flex-1 flex flex-col justify-center">
        {result.valid && result.certificate ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {/* Status Top Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-[#12AC81] p-6 text-white text-center">
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600 shadow-lg ring-4 ring-white/30">
                <CheckCircleIcon size={32} />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-extrabold tracking-wide uppercase backdrop-blur-sm">
                <ShieldIcon size={14} /> CERTIFICADO OFICIAL Y AUTÉNTICO
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                Validación de Acreditación Académica
              </h1>
              <p className="mt-1 text-xs text-white/90">
                El presente documento ha sido verificado con éxito en el registro central de Grupo Cognos.
              </p>
            </div>

            {/* Certificate Details */}
            <div className="p-8 sm:p-10 space-y-8 isolate-light-document">
              {/* Participant & Course */}
              <div className="space-y-4 text-center border-b border-slate-100 pb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-[#026BCA]">
                  Otorgado a favor de:
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#00155C]">
                  {result.certificate.studentName}
                </h2>

                <p className="text-xs text-slate-500 font-normal max-w-md mx-auto">
                  Por haber cumplido satisfactoriamente con la totalidad de los requisitos académicos, asistencia reglamentaria (≥ 80%) y evaluaciones aprobadas en el programa:
                </p>

                <div className="rounded-2xl bg-[#F0F7FD] border border-[#D5E7F7] p-5">
                  <h3 className="text-lg sm:text-xl font-bold text-[#00155C]">
                    «{result.certificate.courseTitle}»
                  </h3>
                </div>
              </div>

              {/* Validation Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calificación</p>
                  <p className="mt-1 text-lg font-extrabold text-[#12AC81]">
                    {result.certificate.gradeScore} / 100
                  </p>
                  <span className="text-[10px] font-bold text-[#12AC81]">Aprobado</span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Código Registro</p>
                  <p className="mt-1 font-mono text-sm font-bold text-[#00155C]">
                    {result.certificate.certCode}
                  </p>
                  <span className="text-[10px] text-slate-400">Verificado</span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fecha Emisión</p>
                  <p className="mt-1 text-xs font-bold text-slate-700">
                    {new Date(result.certificate.issuedAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <span className="text-[10px] text-slate-400">Oficial</span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Institución</p>
                  <p className="mt-1 text-xs font-bold text-[#00155C] flex items-center justify-center gap-1">
                    <SchoolIcon size={13} /> Cognos
                  </p>
                  <span className="text-[10px] text-slate-400">+30 Años</span>
                </div>
              </div>

              {/* Signatures & Accreditation Authorities */}
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 bg-[#FAF8F5]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#00155C] text-[#ECD06F] shadow-md">
                      <AwardIcon size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#00155C]">Acreditación Internacional Válida</h4>
                      <p className="text-xs text-slate-600">
                        Certificado expedido por Centro Autorizado de Capacitación y Certificación Cognos.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-center sm:text-right">
                    <p className="text-[11px] font-bold text-[#00155C]">María Eugenia Moreno</p>
                    <p className="text-[9px] text-slate-500">Dirección Ejecutiva · Grupo Cognos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 bg-slate-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 text-center sm:text-left">
                Verificación generada en tiempo real. Código hash: <strong className="font-mono">{certCode}</strong>
              </span>
              <div className="flex gap-2">
                <Link
                  href="/dashboard/search"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Explorar Catálogo
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl bg-[#00155C] px-5 py-2 font-bold text-white shadow-md hover:bg-[#026BCA] transition"
                >
                  Ingresar a la Plataforma
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-2xl text-center">
            <div className="bg-red-50 p-8 text-center border-b border-red-100">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 ring-4 ring-red-200">
                <XCircleIcon size={36} />
              </div>
              <h1 className="text-2xl font-extrabold text-red-900">
                Certificado No Encontrado
              </h1>
              <p className="mt-1 text-xs text-red-700 max-w-sm mx-auto">
                No pudimos verificar el código <strong>{certCode}</strong> en nuestro registro central de acreditaciones.
              </p>
            </div>

            <div className="p-8 space-y-4 max-w-md mx-auto text-xs text-slate-600">
              <p>
                Por favor, verifica que el código introducido coincida exactamente con el impreso en el certificado digital (formato ej. <code>CGN-123456</code>).
              </p>
              <p className="text-slate-500">
                Si crees que esto es un error, contacta a la Dirección Académica de Cognos Capacitación a través de nuestro canal de soporte.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Link
                  href="/"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Ir al Inicio
                </Link>
                <a
                  href="https://wa.me/59178000000?text=Hola%20necesito%20verificar%20un%20certificado"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#25D366] px-5 py-2.5 font-bold text-white shadow-md hover:bg-[#20bd5a] transition"
                >
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-500 py-6 text-xs text-center">
        <p>© {new Date().getFullYear()} Grupo Cognos · Centro de Capacitación y Certificación Internacional</p>
        <p className="mt-1 text-[11px] text-slate-400">
          «El placer de enseñar, la pasión por aprender» · Santa Cruz · La Paz · Santiago · Madrid
        </p>
      </footer>
    </div>
  );
}
