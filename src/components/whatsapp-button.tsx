"use client";

import { WhatsAppIcon } from "@/components/Icons";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppButton({
  phoneNumber = "59178000000",
  defaultMessage = "¡Hola! Necesito soporte académico sobre mi curso en Grupo Cognos.",
}: WhatsAppButtonProps) {
  const encodedMsg = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 group font-poppins">
      {/* Tooltip on hover */}
      <div className="absolute bottom-full right-0 mb-3 hidden sm:flex items-center gap-2 rounded-xl bg-[#00155C] px-3.5 py-2 text-xs font-semibold text-white shadow-xl shadow-[#00155C]/30 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span>Soporte Cognos en Vivo</span>
        <div className="absolute top-full right-5 -mt-1 border-4 border-transparent border-t-[#00155C]" />
      </div>

      {/* Floating button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar soporte por WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/40 transition-all duration-300 hover:scale-110 hover:bg-[#20bd5a] active:scale-95 ring-4 ring-white"
      >
        <WhatsAppIcon size={30} />
      </a>
    </div>
  );
}
