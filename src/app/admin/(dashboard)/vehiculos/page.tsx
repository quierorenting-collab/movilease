import { requireRole } from "@/lib/auth";

export default async function AdminVehiculosPage() {
  await requireRole(["admin", "catalog_editor"]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Vehículos</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        CRUD de vehículos (con subida de fotos a Supabase Storage) — Fase 4.
      </p>
    </div>
  );
}
