import { getCurrentProfile } from "@/lib/auth";
import { USER_ROLE_LABELS } from "@/lib/constants";

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Panel de administración</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Hola{profile?.full_name ? `, ${profile.full_name}` : ""} — rol{" "}
        {profile ? USER_ROLE_LABELS[profile.role] : "-"}.
      </p>
      <p className="mt-6 max-w-lg text-sm text-zinc-500">
        Las estadísticas y accesos rápidos (leads recientes, vehículos activos, borradores de
        blog) se conectan en la Fase 4, cuando exista un proyecto Supabase real con datos.
      </p>
    </div>
  );
}
