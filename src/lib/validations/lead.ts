import { z } from "zod";
import { LEAD_SOURCES } from "@/lib/constants";

export const CLIENT_TYPES = ["empresa", "autonomo", "particular"] as const;

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Introduce tu nombre").max(120),
  lastName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s]{6,20}$/, "Introduce un teléfono válido"),
  email: z.string().trim().email("Email no válido").optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  province: z.string().trim().max(80).optional().or(z.literal("")),
  clientType: z.enum(CLIENT_TYPES).optional(),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  modelId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  source: z.enum(LEAD_SOURCES).default("contact_form"),
  pageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  rgpd: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .refine((v) => v === "on" || v === "true" || v === true, {
      message: "Debes aceptar la política de privacidad",
    }),
  // honeypot anti-spam: si viene relleno, es un bot
  website: z.string().max(0).optional().or(z.literal("")),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;
