import { requireRole } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["admin", "catalog_editor", "leads_viewer"]);

  return (
    <div className="flex min-h-screen">
      <Sidebar role={profile.role} />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
