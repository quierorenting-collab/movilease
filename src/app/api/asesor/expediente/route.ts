import { NextResponse } from "next/server";
import { z } from "zod";
import { createLead } from "@/lib/actions/leads";
import { crearExpediente, getRequisitos } from "@/lib/data/asesor";
import { hashTokenSesion, nuevoTokenSesion } from "@/lib/asesor/sesion";

/**
 * Cierre del asesor guiado: crea el lead y abre su expediente.
 *
 * Se llama UNA sola vez por visitante, al final del recorrido, cuando ya ha
 * elegido coche y deja sus datos. No se llama en cada paso a propósito: cada
 * `createLead` con éxito inserta una fila, manda un email y dispara un
 * Telegram, y no hay deduplicación. Llamarlo por paso llenaría el móvil de
 * Adrián de avisos del mismo cliente.
 */

const esquema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[+\d][\d\s]{6,20}$/),
  email: z.string().trim().email().optional().or(z.literal("")),
  clientType: z.enum(["particular", "autonomo", "empresa"]),
  vehicleId: z.string().uuid().optional(),
  pageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  rgpd: z.literal(true),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = esquema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  // createLead lee del FormData, y `email`, `message` y `website` los lee SIN
  // `|| undefined`: una clave ausente llega como null y zod la rechaza. Por
  // omitirlas se perdieron durante meses todos los leads del pop-up de la
  // home. Van siempre, aunque vayan vacías.
  const fd = new FormData();
  fd.set("name", d.name);
  fd.set("phone", d.phone);
  fd.set("email", d.email ?? "");
  fd.set("message", "");
  fd.set("website", "");
  fd.set("rgpd", "on");
  fd.set("clientType", d.clientType);
  fd.set("source", "contact_form");
  fd.set("pageUrl", d.pageUrl ?? "");
  if (d.vehicleId) fd.set("vehicleId", d.vehicleId);

  const lead = await createLead(fd);
  if (!lead.success) {
    return NextResponse.json({ ok: false, error: lead.error ?? "No se pudo registrar" }, { status: 400 });
  }

  // El token viaja al navegador; en la base solo queda su hash.
  const token = nuevoTokenSesion();
  const creado = await crearExpediente({
    sessionTokenHash: hashTokenSesion(token),
    clientType: d.clientType,
    vehicleId: d.vehicleId ?? null,
    leadId: lead.leadId ?? null,
  });

  // Si el expediente falla, el lead YA está guardado y notificado: el contacto
  // no se pierde, que es lo que importa. Se devuelve éxito con el enlace de
  // WhatsApp y sin expediente, y el widget se comporta como un formulario
  // normal en lugar de decirle al cliente que ha fallado algo que sí funcionó.
  if (!creado) {
    return NextResponse.json({
      ok: true,
      expediente: null,
      whatsappLink: lead.whatsappLink,
      requisitos: [],
    });
  }

  const requisitos = await getRequisitos(d.clientType);

  return NextResponse.json({
    ok: true,
    token,
    expediente: { id: creado.expediente.id },
    whatsappLink: lead.whatsappLink,
    requisitos: requisitos.map((r) => ({
      key: r.key,
      label: r.label,
      esperados: r.expectedCount,
    })),
  });
}
