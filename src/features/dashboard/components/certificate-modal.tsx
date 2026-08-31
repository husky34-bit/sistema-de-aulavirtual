"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AwardIcon, DownloadIcon, CheckCircleIcon, ShieldIcon } from "@/components/Icons";

interface CertificateModalProps {
  studentName: string;
  courseTitle: string;
  gradeScore?: number;
  issueDate?: string;
}

export function CertificateModal({
  studentName,
  courseTitle,
  gradeScore = 95,
  issueDate = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
}: CertificateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [certId] = useState(() => `CGN-${Math.floor(100000 + Math.random() * 900000)}`);

  function handlePrint() {
    window.print();
  }

  const verifyUrl = `/verify/${certId}`;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ECD06F] via-[#E5B842] to-[#C89B27] px-4 py-2 text-xs font-bold text-[#00155C] shadow-md shadow-[#ECD06F]/30 hover:scale-105 active:scale-95 transition-all"
      >
        <AwardIcon size={16} />
        <span>Ver Certificado Oficial</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#00155C] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <AwardIcon size={20} className="text-[#ECD06F]" />
                <h3 className="font-bold text-sm">Certificado Digital de Acreditación · Cognos</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Certificate Canvas Frame */}
            <div className="p-8 bg-[#FAF8F5] print:p-0 isolate-light-document">
              <div className="relative rounded-2xl border-4 border-[#00155C] bg-white p-8 text-center shadow-inner overflow-hidden">
                {/* Decorative borders */}
                <div className="absolute inset-2 border border-[#ECD06F]/50 rounded-xl pointer-events-none" />
                <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#00155C]/5" />
                <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-[#ECD06F]/10" />

                {/* Cognos Logo */}
                <div className="mx-auto flex justify-center mb-4">
                  <Image
                    src="/images/logos/LG.webp"
                    alt="Cognos Capacitación"
                    width={180}
                    height={48}
                    className="h-10 w-auto object-contain"
                  />
                </div>

                <p className="text-[11px] font-extrabold tracking-widest text-[#026BCA] uppercase">
                  GRUPO COGNOS · CENTRO DE CAPACITACIÓN & CERTIFICACIÓN
                </p>

                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#00155C] tracking-wide font-serif">
                  CERTIFICADO DE APROBACIÓN
                </h2>

                <p className="mt-3 text-xs text-slate-500 font-normal">
                  Se certifica que por haber cumplido satisfactoriamente con todos los requisitos académicos,
                  asistencia reglamentaria (≥ 80%) y evaluaciones, se otorga la presente distinción a:
                </p>

                <div className="my-4 border-b-2 border-[#00155C] pb-2 inline-block max-w-lg w-full">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#00155C]">
                    {studentName}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 font-normal">
                  Por su destacada participación y aprobación del programa de especialización:
                </p>

                <h4 className="mt-1 text-base sm:text-lg font-extrabold text-[#026BCA]">
                  «{courseTitle}»
                </h4>

                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-200 pt-4 text-left text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Calificación Final</p>
                    <p className="font-extrabold text-[#12AC81] text-sm">{gradeScore} / 100 Puntos</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <CheckCircleIcon size={10} className="text-[#12AC81]" /> Aprobado (≥ 70 pts)
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Código de Registro</p>
                    <p className="font-mono font-bold text-slate-800 text-xs mt-0.5">{certId}</p>
                    <Link
                      href={verifyUrl}
                      target="_blank"
                      className="text-[10px] text-[#026BCA] font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      <ShieldIcon size={10} /> Validar Online ↗
                    </Link>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Fecha de Emisión</p>
                    <p className="font-bold text-slate-800 text-xs mt-0.5">{issueDate}</p>
                    <p className="text-[10px] text-slate-500">Santa Cruz · Bolivia</p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="mt-8 flex justify-around items-end pt-4 border-t border-dashed border-slate-200">
                  <div className="text-center">
                    <div className="h-0.5 w-36 bg-slate-400 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-[#00155C]">María Eugenia Moreno</p>
                    <p className="text-[9px] text-slate-500">Dirección Ejecutiva · Cognos</p>
                  </div>
                  <div className="text-center">
                    <div className="h-0.5 w-36 bg-slate-400 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-[#00155C]">Germán Zelada Ruck</p>
                    <p className="text-[9px] text-slate-500">Dirección Académica · Cognos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 gap-3">
              <span className="text-xs text-slate-500 text-center sm:text-left">
                Verificable en: <strong className="font-mono text-slate-700">{verifyUrl}</strong>
              </span>
              <div className="flex gap-2">
                <Link
                  href={verifyUrl}
                  target="_blank"
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition inline-flex items-center gap-1.5"
                >
                  <ShieldIcon size={13} />
                  <span>Portal QR</span>
                </Link>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00155C] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#026BCA] transition"
                >
                  <DownloadIcon size={14} />
                  <span>Imprimir / PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
