import { getUsers } from "@/features/users/actions/get-users";
import { requireRole } from "@/lib/auth-helpers";
import { UserRoleSelect } from "@/features/users/components/user-role-select";
import { RegisterStudentModal } from "@/features/users/components/register-student-modal";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { q } = await searchParams;
  const users = await getUsers(q);

  return (
    <div className="space-y-6 font-poppins">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#00155C]">Gestión de Usuarios</h1>
          <span className="text-xs text-slate-500">
            {users.length} usuarios registrados en la plataforma
          </span>
        </div>
        <RegisterStudentModal />
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o email..."
          className="w-full max-w-sm rounded border border-slate-300 p-2"
        />
        <button
          type="submit"
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Buscar
        </button>
      </form>

      {users.length === 0 ? (
        <p className="text-slate-500">No se encontraron usuarios.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left text-sm text-slate-500">
              <th className="p-2">Nombre</th>
              <th className="p-2">Email</th>
              <th className="p-2">Rol</th>
              <th className="p-2">Cursos</th>
              <th className="p-2">Registro</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-2 text-slate-900">{user.name}</td>
                <td className="p-2 text-slate-700">{user.email}</td>
                <td className="p-2">
                  <UserRoleSelect
                    userId={user.id}
                    currentRole={user.role}
                  />
                </td>
                <td className="p-2 text-slate-700">
                  {user._count.enrollments}
                </td>
                <td className="p-2 text-sm text-slate-500">
                  {user.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
