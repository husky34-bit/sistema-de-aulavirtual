import { requireAuth } from "@/lib/auth-helpers";
import { BadgeGallery } from "@/features/badges/components/badge-gallery";

export default async function BadgesPage() {
  await requireAuth();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Mis Insignias</h1>
      <BadgeGallery />
    </div>
  );
}
