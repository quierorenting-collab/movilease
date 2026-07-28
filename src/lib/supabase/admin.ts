import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Cliente con la service role key: se salta RLS por completo.
 * SOLO para uso server-side (invitar usuarios, tareas de mantenimiento).
 * El import "server-only" hace fallar el build si algún componente cliente
 * intenta importar este módulo.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
