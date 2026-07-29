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
