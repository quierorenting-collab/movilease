import Link from "next/link";
import type { UserRoleEnum } from "@/types/database.types";
import { USER_ROLE_LABELS } from "@/lib/constants";

const NAV_ITEMS: { href: string; label: string; roles: UserRoleEnum[] }[] = [
  { href: "/admin", label: "Panel", roles: ["admin", "catalog_editor", "leads_viewer"] },
  { href: "/admin/vehiculos", label: "Vehículos", roles: ["admin", "catalog_editor"] },
  { href: "/admin/marcas", label: "Marcas", roles: ["admin", "catalog_editor"] },
  { href: "/admin/modelos", label: "Modelos", roles: ["admin", "catalog_editor"] },
  { href: "/admin/leads", label: "Clientes", roles: ["admin", "leads_viewer"] },
  { href: "/admin/blog", label: "Blog", roles: ["admin", "catalog_editor"] },
  { href: "/admin/seo", label: "SEO", roles: ["admin", "catalog_editor"] },
  { href: "/admin/usuarios", label: "Usuarios", roles: ["admin"] },
];

export function Sidebar({ role }: { role: UserRoleEnum }) {
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-56 shrink-0 border-r border-black/10 p-4 dark:border-white/10">
      <nav className="flex flex-col gap-1 text-sm">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="mt-6 px-3 text-xs text-zinc-500">Rol: {USER_ROLE_LABELS[role]}</p>
    </aside>
  );
}
