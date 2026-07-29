export interface LeadNotificationPayload {
  name: string;
  lastName?: string | null;
  phone: string;
  email?: string | null;
  company?: string | null;
  province?: string | null;
  clientType?: "empresa" | "autonomo" | "particular" | null;
  message?: string | null;
  vehicleLabel?: string | null;
  createdAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  pageUrl?: string | null;
}
