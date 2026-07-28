import { z } from "zod";
import { LEAD_SOURCES } from "@/lib/constants";

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Introduce tu nombre").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s]{6,20}$/, "Introduce un teléfono válido"),
  email: z.string().trim().email("Email no válido").optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  modelId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  source: z.enum(LEAD_SOURCES).default("contact_form"),
  // honeypot anti-spam: si viene relleno, es un bot
  website: z.string().max(0).optional().or(z.literal("")),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;
