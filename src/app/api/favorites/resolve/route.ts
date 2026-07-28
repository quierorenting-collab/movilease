import { NextResponse } from "next/server";
import { z } from "zod";
import { getVehiclesByIds } from "@/lib/data/vehicles";

const bodySchema = z.object({
  vehicleIds: z.array(z.string().uuid()).max(50),
});

/**
 * Los favoritos viven en localStorage del navegador (solo IDs). Este
 * endpoint resuelve esos IDs contra la base de datos para devolver precio
 * y disponibilidad siempre actualizados, sin necesitar cuenta de usuario.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ vehicles: [] }, { status: 400 });
  }

  const vehicles = await getVehiclesByIds(parsed.data.vehicleIds);
  return NextResponse.json({ vehicles });
}
