import "server-only";

interface LeadNotificationPayload {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  vehicleLabel?: string | null;
}

/**
 * Envía el lead por email vía Web3Forms. La API key vive solo en
 * WEB3FORMS_API_KEY (server-side) — nunca en una variable NEXT_PUBLIC_*.
 */
export async function notifyWeb3Forms(lead: LeadNotificationPayload): Promise<boolean> {
  const apiKey = process.env.WEB3FORMS_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: apiKey,
        subject: "Nuevo lead - MoviLease.es",
        from_name: "MoviLease Leads",
        nombre: lead.name,
        telefono: lead.phone,
        email: lead.email ?? "",
        vehiculo: lead.vehicleLabel ?? "",
        mensaje: lead.message ?? "",
      }),
    });
    const data = await response.json();
    return Boolean(data?.success);
  } catch {
    return false;
  }
}
