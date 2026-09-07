"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyWeb3Forms } from "@/lib/notifications/web3forms";
import { notifyTelegram } from "@/lib/notifications/telegram";
import { notifyHubSpot } from "@/lib/notifications/hubspot";
import { leadFormSchema } from "@/lib/validations/lead";
import { buildWhatsAppLink } from "@/lib/constants";

export interface CreateLeadResult {
  success: boolean;
  error?: string;
  whatsappLink?: string;
  /**
   * Id de la fila insertada. Lo necesita el asesor guiado para enlazar el
   * expediente con su lead (`expedientes.lead_id`); sin esto habría que
   * reconsultar por teléfono, que no identifica de forma única.
   * Añadido, no sustituido: quien no lo mire sigue funcionando igual.
   */
  leadId?: string;
}

export async function createLead(formData: FormData): Promise<CreateLeadResult> {
  /* `formData.get` devuelve null cuando el campo no viene, y zod no acepta null
     en un `.optional()`: espera undefined. Los formularios de la web siempre
     mandan todos los campos —incluido el honeypot, que es un input oculto— asi
     que nunca se noto. Pero /api/leads existe precisamente para integraciones
     que no son nuestro formulario, y ahi cualquier peticion que no mandara el
     campo trampa se rechazaba con un escueto "Invalid input". Salio probando
     el volcado a HubSpot con una peticion JSON normal. */
  const campo = (nombre: string) => formData.get(nombre) ?? undefined;

  const parsed = leadFormSchema.safeParse({
    name: campo("name"),
    lastName: campo("lastName") || undefined,
    phone: campo("phone"),
    email: campo("email"),
    company: campo("company") || undefined,
    province: campo("province") || undefined,
    clientType: campo("clientType") || undefined,
    message: campo("message"),
    modelId: campo("modelId") || undefined,
    vehicleId: campo("vehicleId") || undefined,
    source: campo("source") || "contact_form",
    pageUrl: campo("pageUrl") || undefined,
    rgpd: campo("rgpd") || undefined,
    website: campo("website") ?? "",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }

  const {
    name,
    lastName,
    phone,
    email,
    company,
    province,
    clientType,
    message,
    modelId,
    vehicleId,
    source,
    pageUrl,
    website,
  } = parsed.data;

  // Honeypot: si el campo trampa viene relleno, se descarta en silencio como si hubiera ido bien.
  if (website) {
    return { success: true, whatsappLink: buildWhatsAppLink(`Hola, soy ${name}`) };
  }

  const fallback: CreateLeadResult = {
    success: false,
    error: "No se ha podido registrar la solicitud. Escríbenos directamente por WhatsApp mientras tanto.",
  };

  // Cualquier fallo (Supabase sin configurar todavía, red, RLS...) debe dar un
  // mensaje controlado al usuario, nunca un 500 crudo.
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = headersList.get("user-agent");

    const supabase = createAdminClient();
    const { data: insertedLead, error } = await supabase
      .from("leads")
      .insert({
        name,
        last_name: lastName || null,
        phone,
        email: email || null,
        company: company || null,
        province: province || null,
        client_type: clientType ?? null,
        message: message || null,
        model_id: modelId ?? null,
        vehicle_id: vehicleId ?? null,
        source,
        ip_address: ipAddress,
        user_agent: userAgent,
        page_url: pageUrl || null,
      })
      .select("id")
      .single();

    if (error || !insertedLead) {
      if (error) console.error("createLead insert error:", error);
      return fallback;
    }

    const createdAt = new Date();

    /* La etiqueta del vehículo (marca, modelo y versión) la esperaban ya el
       aviso de Telegram y el de correo, pero nunca se rellenaba: llegaba
       siempre vacía. La necesita además el nombre de la negociación de
       HubSpot, porque "Juan — solicitud web" no sirve para trabajar un embudo.
       Va en su propio try: si falla la consulta, el lead sigue su camino sin
       etiqueta, que es exactamente lo que pasaba hasta ahora. */
    let vehicleLabel: string | null = null;
    if (vehicleId) {
      try {
        const { data: v } = await supabase
          .from("vehicles")
          .select("version, model_id")
          .eq("id", vehicleId)
          .single();
        if (v) {
          const { data: m } = await supabase
            .from("models")
            .select("name, brand_id")
            .eq("id", v.model_id)
            .single();
          const { data: b } = m
            ? await supabase.from("brands").select("name").eq("id", m.brand_id).single()
            : { data: null };
          vehicleLabel = [b?.name, m?.name, v.version].filter(Boolean).join(" ") || null;
        }
      } catch {
        vehicleLabel = null;
      }
    }

    const notificationPayload = {
      name,
      lastName,
      phone,
      email,
      company,
      province,
      clientType,
      message,
      vehicleLabel,
      createdAt,
      ipAddress,
      userAgent,
      pageUrl,
    };

    const [web3formsOk, telegramOk, hubspotOk] = await Promise.allSettled([
      notifyWeb3Forms(notificationPayload),
      notifyTelegram(notificationPayload),
      notifyHubSpot(notificationPayload),
    ]).then((results) => results.map((r) => (r.status === "fulfilled" ? r.value : false)));

    await supabase
      .from("leads")
      .update({ notified_web3forms: web3formsOk, notified_telegram: telegramOk })
      .eq("id", insertedLead.id);

    /* La marca de HubSpot va en su propia consulta y no junto a las otras dos:
       la columna llega en la migración 0006 y este despliegue puede ir por
       delante. Si todavía no existe, esta línea falla sola y las otras dos
       marcas quedan escritas igual. */
    try {
      await supabase
        .from("leads")
        .update({ notified_hubspot: hubspotOk })
        .eq("id", insertedLead.id);
    } catch {
      /* columna aún no migrada */
    }

    return {
      success: true,
      leadId: insertedLead.id,
      whatsappLink: buildWhatsAppLink(`Hola, soy ${name}, me gustaría más información sobre renting.`),
    };
  } catch {
    return fallback;
  }
}

/** Firma compatible con useActionState (previousState, formData) => nuevo estado. */
export async function createLeadAction(
  _previousState: CreateLeadResult | null,
  formData: FormData
): Promise<CreateLeadResult> {
  return createLead(formData);
}
