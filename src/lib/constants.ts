/**
 * Nombre/URL usados donde NO hay una request de la que leer el host (admin
 * interno, sitemap.ts/robots.ts). El branding dinámico por dominio público
 * vive en lib/brand.ts (getCurrentBrand/resolveBrand).
 */
export const DEFAULT_BRAND_NAME = "MoviLease";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://movilease.es";

export const CONTACT = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "34613267375",
  email: "quierorenting@gmail.com",
  instagram: "https://www.instagram.com/quierorenting",
} as const;

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
  ganado: "Ganado",
  perdido: "Perdido",
} as const;

export type LeadStatus = keyof typeof LEAD_STATUS_LABELS;

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
