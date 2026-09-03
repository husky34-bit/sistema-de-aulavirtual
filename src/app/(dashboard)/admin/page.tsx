import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import {
  SiteAdministrationView,
  AdminTabKey,
} from "@/features/admin/components/site-administration-view";

export const metadata = {
  title: "Administración del Sitio · Cognos LMS",
};

export default async function AdminSitePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireRole(["ADMIN", "MANAGER"]);
  const { tab } = await searchParams;

  const validTabs: AdminTabKey[] = [
    "usuarios",
    "cursos",
    "calificaciones",
    "informes",
    "sistema",
  ];

  const initialTab: AdminTabKey = validTabs.includes(tab as AdminTabKey)
    ? (tab as AdminTabKey)
    : "usuarios";

  const courses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <SiteAdministrationView initialTab={initialTab} courses={courses} />
  );
}
