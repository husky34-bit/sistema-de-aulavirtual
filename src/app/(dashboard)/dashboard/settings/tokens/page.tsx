import { requireAuth } from "@/lib/auth-helpers";
import { TokenManager } from "@/features/webservices/components/token-manager";

export default async function TokensPage() {
  await requireAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tokens de API</h1>
        <p className="text-sm text-slate-500">
          Genera tokens para integraciones externas (API REST v1).
        </p>
      </div>
      <TokenManager />
    </div>
  );
}
