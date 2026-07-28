import "server-only";

interface LeadNotificationPayload {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  vehicleLabel?: string | null;
}

/**
 * Notificación push instantánea por Telegram. Token y chat id viven solo en
 * TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID (server-side).
 */
export async function notifyTelegram(lead: LeadNotificationPayload): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const lines = [
    "🚗 <b>Nuevo lead — MoviLease.es</b>",
    `Nombre: ${lead.name}`,
    `Teléfono: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : null,
    lead.vehicleLabel ? `Vehículo: ${lead.vehicleLabel}` : null,
    lead.message ? `Mensaje: ${lead.message}` : null,
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
