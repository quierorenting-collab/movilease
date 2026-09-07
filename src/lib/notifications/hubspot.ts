import "server-only";
import { CLIENT_TYPE_LABELS } from "@/lib/constants";
import type { LeadNotificationPayload } from "./types";

/**
 * Vuelca el lead en HubSpot: contacto + negociación asociada.
 *
 * Va como un canal más junto a Telegram y el correo, y por el mismo motivo que
 * ellos: el lead YA está guardado en Supabase antes de llegar aquí, así que si
 * HubSpot falla, caduca el token o cambia la API, no se pierde nada. Esta
 * función no lanza nunca; devuelve false y lo deja escrito en el log.
 *
 * Sin HUBSPOT_TOKEN el canal está sencillamente apagado (devuelve false sin
 * tocar la red), que es como se despliega la primera vez: el código puede
 * estar en producción antes de que exista el token.
 *
 * El token sale de una "private app" de HubSpot con permisos de escritura y
 * lectura sobre contactos y negociaciones. Vive solo en la variable de entorno,
 * nunca en el repositorio.
 *
 * Dos cosas que conviene saber de este código:
 *
 * - El contacto se busca antes de crearlo, por email y por teléfono. HubSpot
 *   solo deduplica solo por email; si el lead no deja email —en el formulario
 *   corto es opcional— sin esta búsqueda tendríamos un contacto nuevo por cada
 *   solicitud de la misma persona. La búsqueda por teléfono es aproximada:
 *   compara la cadena tal cual, así que un mismo número escrito con y sin
 *   prefijo no casa. Aun así quita la mayoría de los duplicados.
 * - La etapa del embudo no se codifica aquí. Si no se configuran
 *   HUBSPOT_PIPELINE_ID y HUBSPOT_DEALSTAGE_ID, se pregunta a HubSpot por su
 *   embudo por defecto y se coge su primera etapa. Así funciona el día uno sin
 *   que nadie tenga que copiar identificadores, y se puede afinar después sin
 *   tocar el código.
 */

const API = "https://api.hubapi.com";
const ESPERA_MS = 8000;

/** deal_to_contact en el catálogo de asociaciones de HubSpot. */
const ASOCIACION_NEGOCIACION_CONTACTO = 3;

type Etapa = { pipeline: string; dealstage: string };

/** El embudo por defecto se pregunta una vez por proceso, no en cada lead. */
let etapaCacheada: Etapa | null = null;

async function llamar(
  token: string,
  ruta: string,
  init: { method: string; body?: unknown }
): Promise<unknown | null> {
  try {
    const respuesta = await fetch(`${API}${ruta}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: AbortSignal.timeout(ESPERA_MS),
    });
    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => "");
      console.error(`HubSpot ${init.method} ${ruta} -> ${respuesta.status}`, detalle.slice(0, 400));
      return null;
    }
    return await respuesta.json().catch(() => ({}));
  } catch (error) {
    console.error(`HubSpot ${init.method} ${ruta} falló:`, error);
    return null;
  }
}

async function resolverEtapa(token: string): Promise<Etapa | null> {
  const pipeline = process.env.HUBSPOT_PIPELINE_ID;
  const dealstage = process.env.HUBSPOT_DEALSTAGE_ID;
  if (pipeline && dealstage) return { pipeline, dealstage };
  if (etapaCacheada) return etapaCacheada;

  const datos = (await llamar(token, "/crm/v3/pipelines/deals", { method: "GET" })) as {
    results?: Array<{
      id: string;
      stages?: Array<{ id: string; displayOrder?: number }>;
    }>;
  } | null;

  const embudo = datos?.results?.[0];
  const primera = embudo?.stages
    ?.slice()
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))[0];
  if (!embudo || !primera) return null;

  etapaCacheada = { pipeline: pipeline ?? embudo.id, dealstage: dealstage ?? primera.id };
  return etapaCacheada;
}

async function buscarContacto(
  token: string,
  email?: string | null,
  telefono?: string | null
): Promise<string | null> {
  const grupos: Array<{ filters: Array<{ propertyName: string; operator: string; value: string }> }> = [];
  if (email) grupos.push({ filters: [{ propertyName: "email", operator: "EQ", value: email }] });
  if (telefono) grupos.push({ filters: [{ propertyName: "phone", operator: "EQ", value: telefono }] });
  if (grupos.length === 0) return null;

  const datos = (await llamar(token, "/crm/v3/objects/contacts/search", {
    method: "POST",
    // Los grupos se combinan con O: vale que coincida el email o el teléfono.
    body: { filterGroups: grupos, properties: ["email", "phone"], limit: 1 },
  })) as { results?: Array<{ id: string }> } | null;

  return datos?.results?.[0]?.id ?? null;
}

function propiedadesContacto(lead: LeadNotificationPayload): Record<string, string> {
  const props: Record<string, string> = { firstname: lead.name, phone: lead.phone };
  if (lead.lastName) props.lastname = lead.lastName;
  if (lead.email) props.email = lead.email;
  if (lead.company) props.company = lead.company;
  if (lead.province) props.state = lead.province;
  return props;
}

export async function notifyHubSpot(lead: LeadNotificationPayload): Promise<boolean> {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) return false;

  const props = propiedadesContacto(lead);
  const existente = await buscarContacto(token, lead.email, lead.phone);

  let contactoId: string | null = existente;
  if (existente) {
    // Solo se envían los campos que traen dato: una segunda solicitud sin email
    // no debe borrar el email que ya tuviera la ficha.
    const actualizado = await llamar(token, `/crm/v3/objects/contacts/${existente}`, {
      method: "PATCH",
      body: { properties: props },
    });
    if (actualizado === null) contactoId = null;
  } else {
    const creado = (await llamar(token, "/crm/v3/objects/contacts", {
      method: "POST",
      body: { properties: { ...props, lifecyclestage: "lead" } },
    })) as { id?: string } | null;
    contactoId = creado?.id ?? null;
  }

  if (!contactoId) return false;

  const etapa = await resolverEtapa(token);
  if (!etapa) {
    // Sin embudo no se puede crear la negociación, pero el contacto ya está
    // dentro: se da por bueno a medias y se deja dicho en el log.
    console.error("HubSpot: no hay embudo de negociaciones; el lead entra solo como contacto");
    return true;
  }

  const nombreCompleto = [lead.name, lead.lastName].filter(Boolean).join(" ");
  const descripcion = [
    lead.message ? `Mensaje: ${lead.message}` : null,
    lead.vehicleLabel ? `Vehículo: ${lead.vehicleLabel}` : null,
    lead.clientType ? `Tipo de cliente: ${CLIENT_TYPE_LABELS[lead.clientType]}` : null,
    lead.province ? `Provincia: ${lead.province}` : null,
    lead.pageUrl ? `Página: ${lead.pageUrl}` : null,
    "Origen: formulario de movilease.es",
  ]
    .filter(Boolean)
    .join("\n");

  const negociacion = await llamar(token, "/crm/v3/objects/deals", {
    method: "POST",
    body: {
      properties: {
        dealname: lead.vehicleLabel
          ? `${nombreCompleto} — ${lead.vehicleLabel}`
          : `${nombreCompleto} — solicitud web`,
        pipeline: etapa.pipeline,
        dealstage: etapa.dealstage,
        description: descripcion,
      },
      associations: [
        {
          to: { id: contactoId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: ASOCIACION_NEGOCIACION_CONTACTO,
            },
          ],
        },
      ],
    },
  });

  return negociacion !== null;
}
