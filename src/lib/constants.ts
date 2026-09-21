/**
 * Nombre/URL usados donde NO hay una request de la que leer el host (admin
 * interno, sitemap.ts/robots.ts). El branding dinámico por dominio público
 * vive en lib/brand.ts (getCurrentBrand/resolveBrand).
 */
export const DEFAULT_BRAND_NAME = "MoviLease";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://movilease.es";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "34644156797";

export const CONTACT = {
  whatsappNumber: WHATSAPP_NUMBER,
  /** Mismo número, en formato marcable (href="tel:") y legible. */
  phone: `+${WHATSAPP_NUMBER}`,
  phoneDisplay: formatSpanishPhone(WHATSAPP_NUMBER),
  email: "contacto@movilease.es",
  instagram: "https://www.instagram.com/quierorenting",
} as const;

/** "34644156797" -> "+34 644 15 67 97" */
function formatSpanishPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("34") && digits.length === 11) {
    const n = digits.slice(2);
    return `+34 ${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7)}`;
  }
  return `+${digits}`;
}

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const FUEL_TYPE_LABELS = {
  gasolina: "Gasolina",
  hibrido: "Híbrido",
  electrico: "Eléctrico",
  diesel: "Diesel",
  /* En castellano y no la sigla: «PHEV» no le dice nada a quien no sabe de
     coches, y el CR-V y el S700 se leían como híbridos a secas. Sale en las
     tarjetas, en la ficha, en el comparador y en el filtro del catálogo. */
  phev: "Híbrido enchufable",
} as const;

export type FuelType = keyof typeof FUEL_TYPE_LABELS;

export const TRANSMISSION_LABELS = {
  manual: "Manual",
  automatico: "Automático",
} as const;

export type TransmissionType = keyof typeof TRANSMISSION_LABELS;

export const VEHICLE_CATEGORY_LABELS = {
  turismo: "Turismo",
  suv: "SUV",
  hibrido: "Híbrido",
  furgoneta: "Furgoneta",
  "4x4": "4x4",
  diesel: "Diesel",
} as const;

export type VehicleCategory = keyof typeof VEHICLE_CATEGORY_LABELS;

export const LEAD_STATUS_LABELS = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  en_proceso: "En proceso",
  oferta_enviada: "Oferta enviada",
  ganado: "Ganado",
  perdido: "Perdido",
} as const;

export type LeadStatus = keyof typeof LEAD_STATUS_LABELS;

export const ENVIRONMENTAL_LABEL_LABELS = {
  "0": "Etiqueta 0",
  eco: "Etiqueta ECO",
  c: "Etiqueta C",
  b: "Etiqueta B",
} as const;

export const CLIENT_TYPE_LABELS = {
  empresa: "Empresa",
  autonomo: "Autónomo",
  particular: "Particular",
} as const;

export type ClientType = keyof typeof CLIENT_TYPE_LABELS;

export const LEAD_SOURCES = [
  "vehicle_page",
  "catalog",
  "contact_form",
  "whatsapp_cta",
  "calculator",
  "landing_page",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const USER_ROLE_LABELS = {
  admin: "Administrador",
  catalog_editor: "Editor de catálogo",
  leads_viewer: "Solo lectura de clientes",
} as const;

export type UserRole = keyof typeof USER_ROLE_LABELS;

export const RENTING_DEFAULTS = {
  /* Aqui habia un contractMonths: 36 que se publicaba tal cual en la
     calculadora. No hay un plazo por defecto que sea cierto: 39 de los 48
     coches activos cotizan a 60 meses, 6 a 36, 2 a 48 y 1 a 72. El plazo sale
     del vehiculo, nunca de aqui. Los km si son iguales en los 48. */
  annualKm: 10000,
  includedServices: [
    "Seguro a todo riesgo",
    "Mantenimiento",
    "Asistencia 24h",
    "Impuesto de circulación",
    "Neumáticos",
  ],
} as const;

/** Entrega rápida (5-15 días): la marca Adrián por modelo, igual que EXCLUSIVOS
 *  en la portada. Va en código y no en badge_text porque ese campo no se pinta
 *  en ninguna parte y hay etiquetas viejas en otros coches que saldrían de golpe.
 *  Todos estos modelos están además en ofertas (is_offer en la base). */
export const ENTREGA_RAPIDA_ETIQUETA = "Entrega rápida · 5-15 días";
export const ENTREGA_RAPIDA_MODELOS: ReadonlySet<string> = new Set([
  "renting-seat-leon",
  "renting-seat-leon-fr",
  "renting-cupra-formentor",
  "renting-mg-hs",
  "renting-seat-ibiza",
  "renting-citroen-c4",
  "renting-ebro-s700",
]);

/**
 * Los enchufables que van primero en la zona «Eléctricos y enchufables» (el
 * bloque de la portada y /renting-electrico), con la etiqueta «Más popular».
 * Decisión de Adrián del 21/09/2026; el orden es el de la lista. En la portada
 * salen ahí aunque ya aparezcan en Ofertas o en Entrega rápida.
 */
export const ENCHUFABLES_MAS_POPULARES: readonly string[] = ["renting-ebro-s700", "renting-honda-cr-v"];
export const MAS_POPULAR_ETIQUETA = "Más popular";
