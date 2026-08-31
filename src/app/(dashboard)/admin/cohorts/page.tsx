import { requireRole } from "@/lib/auth-helpers";
import { getCohorts } from "@/features/cohorts/actions/cohort-actions";
import { CohortManager } from "@/features/cohorts/components/cohort-manager";

export default async function CohortsPage() {
  await requireRole(["ADMIN", "MANAGER"]);
  const result = await getCohorts();
  const cohorts = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Cohortes</h1>
      <CohortManager
        cohorts={cohorts.map((c) => ({ id: c.id, name: c.name, memberCount: c._count.members }))}
      />
    </div>
  );
}
