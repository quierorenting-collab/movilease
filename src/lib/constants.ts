/**
 * Nombre/URL usados donde NO hay una request de la que leer el host (admin
 * interno, sitemap.ts/robots.ts). El branding dinámico por dominio público
 * vive en lib/brand.ts (getCurrentBrand/resolveBrand).
 */
export const DEFAULT_BRAND_NAME = "MoviLease";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://movilease.es";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "34613267375";

export const CONTACT = {
  whatsappNumber: WHATSAPP_NUMBER,
  /** Mismo número, en formato marcable (href="tel:") y legible. */
  phone: `+${WHATSAPP_NUMBER}`,
  phoneDisplay: formatSpanishPhone(WHATSAPP_NUMBER),
  email: "quierorenting@gmail.com",
  instagram: "https://www.instagram.com/quierorenting",
} as const;

/** "34613267375" -> "+34 613 26 73 75" */
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
  phev: "PHEV",
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
  contractMonths: 36,
  annualKm: 15000,
  includedServices: [
    "Seguro a todo riesgo",
    "Mantenimiento",
    "Asistencia 24h",
    "Impuesto de circulación",
    "Neumáticos",
  ],
} as const;
