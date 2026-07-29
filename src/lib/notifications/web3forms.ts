import "server-only";
import { CLIENT_TYPE_LABELS } from "@/lib/constants";
import type { LeadNotificationPayload } from "./types";

/**
 * Envía el lead por email vía Web3Forms. La API key vive solo en
 * WEB3FORMS_API_KEY (server-side) — nunca en una variable NEXT_PUBLIC_*.
 */
export async function notifyWeb3Forms(lead: LeadNotificationPayload): Promise<boolean> {
  const apiKey = process.env.WEB3FORMS_API_KEY;
  if (!apiKey) return false;

  const fullName = [lead.name, lead.lastName].filter(Boolean).join(" ");
  const dateStr = lead.createdAt.toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
  const timeStr = lead.createdAt.toLocaleTimeString("es-ES", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
  });

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: apiKey,
        subject: "🚗 Nuevo Lead MOVILEASE",
        from_name: "MoviLease Leads",
        nombre: fullName,
        telefono: lead.phone,
        email: lead.email ?? "",
        empresa: lead.company ?? "",
        provincia: lead.province ?? "",
        tipo_cliente: lead.clientType ? CLIENT_TYPE_LABELS[lead.clientType] : "",
        vehiculo: lead.vehicleLabel ?? "",
        mensaje: lead.message ?? "",
        fecha: dateStr,
        hora: timeStr,
        ip: lead.ipAddress ?? "",
        user_agent: lead.userAgent ?? "",
        pagina: lead.pageUrl ?? "",
      }),
    });
    const data = await response.json();
    return Boolean(data?.success);
  } catch {
    return false;
  }
}
