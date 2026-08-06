import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Cliente Supabase para Server Components, Server Actions y Route Handlers.
 * `cookies()` es asíncrono desde Next.js 15.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se ignora si se llama desde un Server Component: el middleware
            // ya se encarga de refrescar la sesión en cada request.
          }
        },
      },
    }
  );
}

/**
 * Cliente para contenido público que es idéntico para todo el mundo: artículos
 * del blog, catálogo, fichas.
 *
 * No toca cookies a propósito. `cookies()` es una API dinámica: en cuanto se
 * usa, Next marca la página como dinámica, y si esa página se había generado
 * en el build con generateStaticParams revienta en producción con
 * "Page changed from static to dynamic at runtime, reason: headers".
 *
 * Al no leer sesión sólo ve lo que permita la RLS a un usuario anónimo, que es
 * exactamente lo que queremos para contenido público.
 */
export function createPublicClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // sin sesión: no hay nada que persistir
        },
      },
    }
  );
}
