import { requireRole } from "@/lib/auth";

export default async function AdminUsuariosPage() {
  await requireRole(["admin"]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Invitar usuarios y asignar rol (admin / editor de catálogo / solo lectura) — Fase 4.
      </p>
    </div>
  );
}
