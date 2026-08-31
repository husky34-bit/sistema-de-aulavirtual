import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Cognos LMS - Aula Virtual", template: "%s · Cognos LMS" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 font-poppins antialiased">
      {children}
    </div>
  );
}
