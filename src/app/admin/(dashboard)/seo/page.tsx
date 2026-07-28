import { requireRole } from "@/lib/auth";

export default async function AdminSeoPage() {
  await requireRole(["admin", "catalog_editor"]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">SEO</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Metadatos por página, landing pages programáticas y redirecciones — Fase 4/5.
      </p>
    </div>
  );
}
