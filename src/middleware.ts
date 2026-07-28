import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const isLoginRoute = request.nextUrl.pathname.startsWith("/admin/login");

  if (!isLoginRoute && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  // Solo /admin necesita sesión de Supabase; el sitio público no debe
  // depender de que exista un proyecto Supabase configurado para renderizar.
  matcher: ["/admin/:path*"],
};
