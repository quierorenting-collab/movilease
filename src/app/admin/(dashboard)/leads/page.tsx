import { requireRole } from "@/lib/auth";

export default async function AdminLeadsPage() {
  await requireRole(["admin", "leads_viewer"]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Clientes / Leads</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Listado y gestión de solicitudes recibidas — Fase 4.
      </p>
    </div>
  );
}
