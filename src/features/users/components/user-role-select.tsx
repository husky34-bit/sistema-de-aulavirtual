"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "../actions/update-user";
import { ROLES } from "../schemas/user.schema";

export function UserRoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value;
    startTransition(async () => {
      const result = await updateUserRole({ userId, role });
      if (!result.success) alert(result.error);
      router.refresh();
    });
  }

  return (
    <select
      defaultValue={currentRole}
      onChange={handleChange}
      disabled={isPending}
      className="rounded border border-slate-300 p-1 text-sm disabled:opacity-50"
    >
      {ROLES.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}
