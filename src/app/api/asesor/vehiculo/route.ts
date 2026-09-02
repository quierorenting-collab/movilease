import { NextResponse } from "next/server";
import { z } from "zod";
import { asignarVehiculo } from "@/lib/data/asesor";
import { hashTokenSesion } from "@/lib/asesor/sesion";

/**
 * Anota el coche elegido en un expediente que ya existe.
 *
 * Se llama después de `/api/asesor/expediente`, porque el contacto se pide al
 * principio del recorrido y el coche se elige más tarde. Sin esto, el aviso le
 * llegaría a Adrián sin el dato que más falta le hace para la llamada.
 *
 * La autorización es el token de sesión del propio visitante: se compara su
 * hash contra `conversations.session_token_hash`. No vale el id del
 * expediente, que viaja al navegador y sería adivinable.
 */

const esquema = z.object({
  token: z.string().min(20).max(200),
  vehicleId: z.string().uuid(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = esquema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ok = await asignarVehiculo(hashTokenSesion(parsed.data.token), parsed.data.vehicleId);

  // Un token que no corresponde a ninguna conversación y un fallo de Supabase
  // se responden igual, a propósito: distinguirlos convertiría esta ruta en un
  // oráculo para saber qué tokens existen.
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
