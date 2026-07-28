"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyWeb3Forms } from "@/lib/notifications/web3forms";
import { notifyTelegram } from "@/lib/notifications/telegram";
import { leadFormSchema } from "@/lib/validations/lead";
import { buildWhatsAppLink } from "@/lib/constants";

export interface CreateLeadResult {
  success: boolean;
  error?: string;
  whatsappLink?: string;
}

export async function createLead(formData: FormData): Promise<CreateLeadResult> {
  const parsed = leadFormSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message"),
    modelId: formData.get("modelId") || undefined,
    vehicleId: formData.get("vehicleId") || undefined,
    source: formData.get("source") || "contact_form",
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }

  const { name, phone, email, message, modelId, vehicleId, source, website } = parsed.data;

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
    const supabase = await createClient();
    const { data: insertedLead, error } = await supabase
      .from("leads")
      .insert({
        name,
        phone,
        email: email || null,
        message: message || null,
        model_id: modelId ?? null,
        vehicle_id: vehicleId ?? null,
        source,
      })
      .select("id")
      .single();

    if (error || !insertedLead) return fallback;

    const [web3formsOk, telegramOk] = await Promise.allSettled([
      notifyWeb3Forms({ name, phone, email, message }),
      notifyTelegram({ name, phone, email, message }),
    ]).then((results) => results.map((r) => (r.status === "fulfilled" ? r.value : false)));

    await supabase
      .from("leads")
      .update({ notified_web3forms: web3formsOk, notified_telegram: telegramOk })
      .eq("id", insertedLead.id);

    return {
      success: true,
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
