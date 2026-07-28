import { requireRole } from "@/lib/auth";

export default async function AdminMarcasPage() {
  await requireRole(["admin", "catalog_editor"]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Marcas</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Gestión de marcas — Fase 4.</p>
    </div>
  );
}
