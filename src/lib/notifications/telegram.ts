import "server-only";
import { CLIENT_TYPE_LABELS } from "@/lib/constants";
import type { LeadNotificationPayload } from "./types";

/**
 * Notificación push instantánea por Telegram. Token y chat id viven solo en
 * TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID (server-side).
 */
export async function notifyTelegram(lead: LeadNotificationPayload): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const fullName = [lead.name, lead.lastName].filter(Boolean).join(" ");
  const dateStr = lead.createdAt.toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
  const timeStr = lead.createdAt.toLocaleTimeString("es-ES", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines = [
    "🚗 <b>NUEVO LEAD MOVILEASE</b>",
    `👤 Nombre: ${fullName}`,
    `📞 Teléfono: ${lead.phone}`,
    lead.email ? `📧 Email: ${lead.email}` : null,
    lead.company ? `🏢 Empresa: ${lead.company}` : null,
    lead.province ? `📍 Provincia: ${lead.province}` : null,
    lead.vehicleLabel ? `🚘 Vehículo: ${lead.vehicleLabel}` : null,
    lead.clientType ? `👤 Tipo de cliente: ${CLIENT_TYPE_LABELS[lead.clientType]}` : null,
    lead.message ? `📝 Mensaje: ${lead.message}` : null,
    `🕒 ${dateStr} ${timeStr}`,
    lead.ipAddress ? `IP: ${lead.ipAddress}` : null,
    lead.pageUrl ? `Página: ${lead.pageUrl}` : null,
  ].filter(Boolean);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
      }),
    });
    const data = await response.json();
    return Boolean(data?.ok);
  } catch {
    return false;
  }
}

/**
 * Aviso corto y aparte cuando un lead NO ha llegado a HubSpot.
 *
 * La idea original era una columna `notified_hubspot` en la tabla, pero crear
 * una columna necesita acceso directo a la base de datos —que este entorno no
 * tiene— y, sobre todo, una columna solo sirve si alguien la mira: aquí los
 * leads se leen en Telegram, no en la tabla. Solo se manda cuando falla; si
 * todo va bien, no hay ruido.
 */
export async function avisarFalloHubSpot(lead: LeadNotificationPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const nombre = [lead.name, lead.lastName].filter(Boolean).join(" ");
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `⚠️ <b>No ha entrado en HubSpot</b>
El lead de ${nombre} (${lead.phone}) está guardado y avisado, pero no se ha podido crear en HubSpot. Hay que darlo de alta a mano o revisar la clave.`,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch {
    /* si tampoco sale este aviso, no hay nada más que hacer desde aquí */
  }
}
