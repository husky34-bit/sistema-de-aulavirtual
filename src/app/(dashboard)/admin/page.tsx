import { requireRole } from "@/lib/auth-helpers";
import { SiteAdministrationView, AdminTabKey } from "@/features/admin/components/site-administration-view";

export const metadata = {
  title: "Administración del Sitio",
};

export default async function AdminSitePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireRole(["ADMIN", "MANAGER"]);
  const { tab } = await searchParams;

  const validTabs: AdminTabKey[] = [
    "general",
    "usuarios",
    "cursos",
    "calificaciones",
    "extensiones",
    "apariencia",
    "servidor",
    "informes",
    "desarrollo",
  ];

  const initialTab: AdminTabKey = validTabs.includes(tab as AdminTabKey)
    ? (tab as AdminTabKey)
    : "cursos";

  return <SiteAdministrationView initialTab={initialTab} />;
}
