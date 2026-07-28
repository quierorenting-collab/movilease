import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Invalidación bajo demanda de ISR, llamada desde el panel admin tras
 * crear/editar contenido. Protegida por un secreto compartido, no por sesión
 * de usuario, porque puede invocarse desde Server Actions sin cookies.
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false, error: "No autorizado" }, { status: 401 });
  }

  const { path } = await request.json().catch(() => ({ path: null }));
  if (typeof path !== "string" || !path.startsWith("/")) {
    return NextResponse.json({ revalidated: false, error: "path inválido" }, { status: 400 });
  }

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
