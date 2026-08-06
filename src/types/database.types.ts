/**
 * Tipos escritos a mano reflejando supabase/migrations/0001_init.sql.
 * Sustituir por la salida real de `supabase gen types typescript` en cuanto
 * exista el proyecto Supabase.
 *
 * IMPORTANTE: usar siempre `type X = {...}`, nunca `interface X {...}`, para
 * los modelos de fila. Una `interface` no satisface `Record<string, unknown>`
 * en el chequeo de tipos de @supabase/postgrest-js (GenericTable exige
 * `Row extends Record<string, unknown>`), así que romper esto vuelve `never`
 * los tipos de `.insert()`/`.update()` en tiempo de compilación sin avisar
 * hasta que se usan. Es la misma razón por la que la CLI de Supabase siempre
 * genera `type`, no `interface`.
 */

export type UserRoleEnum = "admin" | "catalog_editor" | "leads_viewer";
export type FuelTypeEnum = "gasolina" | "hibrido" | "electrico" | "diesel" | "phev";
export type TransmissionEnum = "manual" | "automatico";
export type VehicleCategoryEnum = "turismo" | "suv" | "hibrido" | "furgoneta" | "4x4" | "diesel";
export type LeadStatusEnum =
  | "nuevo"
  | "contactado"
  | "en_proceso"
  | "oferta_enviada"
  | "ganado"
  | "perdido";
export type ClientTypeEnum = "empresa" | "autonomo" | "particular";
export type LeadSourceEnum =
  | "vehicle_page"
  | "catalog"
  | "contact_form"
  | "whatsapp_cta"
  | "calculator"
  | "landing_page";
export type ContentStatusEnum = "draft" | "published";
export type LandingPageTypeEnum = "category" | "city";
export type EnvironmentalLabelEnum = "0" | "eco" | "c" | "b";

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRoleEnum;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Model = {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Vehicle = {
  id: string;
  model_id: string;
  version: string;
  version_slug: string;
  category: VehicleCategoryEnum;
  fuel_type: FuelTypeEnum;
  transmission: TransmissionEnum;
  monthly_price_cents: number;
  contract_months: number;
  annual_km: number;
  horsepower: number | null;
  consumption_value: number | null;
  consumption_unit: string | null;
  seats: number | null;
  doors: number | null;
  main_image_url: string | null;
  is_featured: boolean;
  is_offer: boolean;
  badge_text: string | null;
  short_description: string | null;
  description: string | null;
  included_services: string[];
  stock_status: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  environmental_label: EnvironmentalLabelEnum | null;
  colors: string[] | null;
  body_type: string | null;
  equipment: string[];
};

export type VehicleImage = {
  id: string;
  vehicle_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type VehiclePricing = {
  id: string;
  vehicle_id: string;
  contract_months: number;
  annual_km: number;
  monthly_price_cents: number;
  created_at: string;
};

export type Lead = {
  id: string;
  model_id: string | null;
  vehicle_id: string | null;
  name: string;
  last_name: string | null;
  phone: string;
  email: string | null;
  company: string | null;
  province: string | null;
  client_type: ClientTypeEnum | null;
  message: string | null;
  source: LeadSourceEnum;
  status: LeadStatusEnum;
  assigned_to: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  ip_address: string | null;
  user_agent: string | null;
  page_url: string | null;
  notified_web3forms: boolean;
  notified_telegram: boolean;
  created_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_id: string | null;
  status: ContentStatusEnum;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SeoMetadata = {
  id: string;
  path: string;
  title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  noindex: boolean;
  updated_at: string;
};

export type LandingPage = {
  id: string;
  type: LandingPageTypeEnum;
  slug: string;
  title: string;
  h1: string;
  intro_content: string | null;
  filter_json: Record<string, unknown> | null;
  faq: { question: string; answer: string }[];
  meta_description: string | null;
  og_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Redirect = {
  id: string;
  source_path: string;
  destination_path: string;
  status_code: number;
  is_active: boolean;
  created_at: string;
};

/**
 * `Relationships: []` y las claves `Views`/`Functions` son obligatorias para
 * que los tipos de @supabase/postgrest-js infieran Row/Insert/Update en vez
 * de caer en `never` (ver GenericTable/GenericSchema en su código fuente).
 * Al sustituir este fichero por la salida de `supabase gen types typescript`
 * esto se genera automáticamente.
 */
type Table<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, Partial<Profile> & { id: string }>;
      brands: Table<Brand, Partial<Brand> & { name: string; slug: string }>;
      models: Table<Model, Partial<Model> & { brand_id: string; name: string; slug: string }>;
      vehicles: Table<
        Vehicle,
        Partial<Vehicle> & {
          model_id: string;
          version: string;
          version_slug: string;
          category: VehicleCategoryEnum;
          fuel_type: FuelTypeEnum;
          transmission: TransmissionEnum;
          monthly_price_cents: number;
        }
      >;
      vehicle_images: Table<
        VehicleImage,
        Partial<VehicleImage> & { vehicle_id: string; storage_path: string }
      >;
      vehicle_pricing: Table<
        VehiclePricing,
        Partial<VehiclePricing> & {
          vehicle_id: string;
          contract_months: number;
          annual_km: number;
          monthly_price_cents: number;
        }
      >;
      leads: Table<Lead, Partial<Lead> & { name: string; phone: string }>;
      blog_posts: Table<
        BlogPost,
        Partial<BlogPost> & { title: string; slug: string; content: string }
      >;
      seo_metadata: Table<SeoMetadata, Partial<SeoMetadata> & { path: string }>;
      landing_pages: Table<
        LandingPage,
        Partial<LandingPage> & {
          type: LandingPageTypeEnum;
          slug: string;
          title: string;
          h1: string;
        }
      >;
      redirects: Table<
        Redirect,
        Partial<Redirect> & { source_path: string; destination_path: string }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
