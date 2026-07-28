import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRoleEnum } from "@/types/database.types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as Profile | null) ?? null;
}

/**
 * Llamar al principio de cada page.tsx/layout.tsx de /admin que necesite
 * restringir por rol. Redirige a /admin/login si no hay sesión o el rol
 * activo no está autorizado.
 */
export async function requireRole(allowed: UserRoleEnum[]): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile || !profile.is_active) {
    redirect("/admin/login");
  }
  if (!allowed.includes(profile.role)) {
    redirect("/admin");
  }
  return profile;
}
