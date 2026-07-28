-- MoviLease — esquema inicial (Fase 1)
-- Aplicar con `supabase db push` (si se usa el CLI local) o pegando este
-- archivo completo en el SQL Editor del proyecto Supabase.

-- =========================================================================
-- 1. Tipos enum
-- =========================================================================

create type user_role as enum ('admin', 'catalog_editor', 'leads_viewer');
create type fuel_type as enum ('gasolina', 'hibrido', 'electrico', 'diesel', 'phev');
create type transmission_type as enum ('manual', 'automatico');
create type vehicle_category as enum ('turismo', 'suv', 'hibrido', 'furgoneta', '4x4', 'diesel');
create type lead_status as enum ('nuevo', 'contactado', 'en_proceso', 'ganado', 'perdido');
create type lead_source as enum (
  'vehicle_page', 'catalog', 'contact_form', 'whatsapp_cta', 'calculator', 'landing_page'
);
create type content_status as enum ('draft', 'published');
create type landing_page_type as enum ('category', 'city');

-- =========================================================================
-- 2. Tablas core
-- =========================================================================

-- Perfiles: extiende auth.users. Los usuarios se provisionan por invitación
-- (Supabase Admin API / dashboard) — no hay registro público.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role not null default 'leads_viewer',
  avatar_url text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- "models" = combinación marca+modelo. Es la página SEO canónica /renting-marca-modelo.
create table models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, name)
);

-- "vehicles" = acabado/versión concreta dentro de un modelo (precio, specs).
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references models(id) on delete cascade,
  version text not null,
  version_slug text not null,
  category vehicle_category not null,
  fuel_type fuel_type not null,
  transmission transmission_type not null,
  monthly_price_cents integer not null check (monthly_price_cents > 0),
  contract_months integer not null default 36,
  annual_km integer not null default 15000,
  horsepower integer,
  consumption_value numeric(5, 2),
  consumption_unit text default 'l/100km',
  seats integer,
  doors integer,
  main_image_url text,
  is_featured boolean not null default false,
  is_offer boolean not null default false,
  badge_text text,
  short_description text,
  description text,
  included_services text[] not null default array[
    'Seguro a todo riesgo', 'Mantenimiento', 'Asistencia 24h',
    'Impuesto de circulación', 'Neumáticos'
  ],
  stock_status text not null default 'available',
  is_active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (model_id, version_slug)
);

create table vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false
);

create index idx_vehicles_category on vehicles(category);
create index idx_vehicles_fuel_type on vehicles(fuel_type);
create index idx_vehicles_active on vehicles(is_active);
create index idx_vehicles_price on vehicles(monthly_price_cents);
create index idx_vehicle_images_vehicle_id on vehicle_images(vehicle_id);

-- =========================================================================
-- 3. Leads
-- =========================================================================

create table leads (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references models(id) on delete set null,
  vehicle_id uuid references vehicles(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  message text,
  source lead_source not null default 'contact_form',
  status lead_status not null default 'nuevo',
  assigned_to uuid references profiles(id),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  notified_web3forms boolean not null default false,
  notified_telegram boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_leads_status on leads(status);
create index idx_leads_created_at on leads(created_at desc);

-- =========================================================================
-- 4. Blog, SEO, landing pages, redirects
-- =========================================================================

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  author_id uuid references profiles(id),
  status content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Overrides SEO para páginas estáticas (home, catálogo, contacto...).
create table seo_metadata (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  title text,
  meta_description text,
  og_image_url text,
  canonical_url text,
  noindex boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Páginas programáticas SEO: categorías y ciudades.
create table landing_pages (
  id uuid primary key default gen_random_uuid(),
  type landing_page_type not null,
  slug text not null unique,
  title text not null,
  h1 text not null,
  intro_content text,
  filter_json jsonb,
  faq jsonb not null default '[]',
  meta_description text,
  og_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  destination_path text not null,
  status_code integer not null default 301,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- 5. Helper de rol + trigger anti-escalada
-- =========================================================================

create or replace function public.current_role_is(roles user_role[])
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = any(roles) and is_active
  );
$$;

-- Evita que un usuario se auto-asigne un rol distinto al actualizar su propio perfil.
create or replace function public.prevent_role_self_escalation()
returns trigger language plpgsql security definer as $$
begin
  if new.role <> old.role and not current_role_is(array['admin']::user_role[]) then
    raise exception 'No autorizado para cambiar el rol';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_escalation
before update on profiles
for each row execute function prevent_role_self_escalation();

-- Crea automáticamente una fila en profiles cuando se invita/registra un
-- usuario en auth.users. Rol por defecto: leads_viewer (el más restrictivo);
-- un admin existente debe subir el rol manualmente desde /admin/usuarios o SQL.
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_handle_new_auth_user
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- =========================================================================
-- 6. Row Level Security
-- =========================================================================

alter table profiles enable row level security;
alter table brands enable row level security;
alter table models enable row level security;
alter table vehicles enable row level security;
alter table vehicle_images enable row level security;
alter table leads enable row level security;
alter table blog_posts enable row level security;
alter table seo_metadata enable row level security;
alter table landing_pages enable row level security;
alter table redirects enable row level security;

-- profiles: cada uno ve/edita lo suyo, admin ve/edita todo.
create policy "profiles_select" on profiles for select
  using ( id = auth.uid() or current_role_is(array['admin']::user_role[]) );
create policy "profiles_update" on profiles for update
  using ( id = auth.uid() or current_role_is(array['admin']::user_role[]) );
create policy "profiles_admin_all" on profiles for all
  using ( current_role_is(array['admin']::user_role[]) );

-- brands / models: lectura pública de lo activo, escritura admin+catalog_editor, borrado admin.
create policy "brands_public_read" on brands for select
  using ( is_active or current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "brands_staff_write" on brands for insert
  with check ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "brands_staff_update" on brands for update
  using ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "brands_admin_delete" on brands for delete
  using ( current_role_is(array['admin']::user_role[]) );

create policy "models_public_read" on models for select
  using ( is_active or current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "models_staff_write" on models for insert
  with check ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "models_staff_update" on models for update
  using ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "models_admin_delete" on models for delete
  using ( current_role_is(array['admin']::user_role[]) );

-- vehicles: lectura pública de activos, escritura admin+catalog_editor, borrado admin.
create policy "vehicles_public_read" on vehicles for select
  using ( is_active or current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "vehicles_staff_write" on vehicles for insert
  with check ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "vehicles_staff_update" on vehicles for update
  using ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "vehicles_admin_delete" on vehicles for delete
  using ( current_role_is(array['admin']::user_role[]) );

create policy "vehicle_images_public_read" on vehicle_images for select using ( true );
create policy "vehicle_images_staff_write" on vehicle_images for insert
  with check ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "vehicle_images_staff_update" on vehicle_images for update
  using ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "vehicle_images_admin_delete" on vehicle_images for delete
  using ( current_role_is(array['admin']::user_role[]) );

-- leads: insert público (formulario), lectura solo admin+leads_viewer, modificación/borrado solo admin.
create policy "leads_public_insert" on leads for insert
  to anon, authenticated with check ( true );
create policy "leads_staff_read" on leads for select
  using ( current_role_is(array['admin','leads_viewer']::user_role[]) );
create policy "leads_admin_update" on leads for update
  using ( current_role_is(array['admin']::user_role[]) );
create policy "leads_admin_delete" on leads for delete
  using ( current_role_is(array['admin']::user_role[]) );

-- blog_posts: lectura pública de lo publicado, escritura/borrado admin+catalog_editor.
create policy "blog_posts_public_read" on blog_posts for select
  using ( status = 'published' or current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "blog_posts_staff_write" on blog_posts for insert
  with check ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "blog_posts_staff_update" on blog_posts for update
  using ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "blog_posts_staff_delete" on blog_posts for delete
  using ( current_role_is(array['admin','catalog_editor']::user_role[]) );

-- seo_metadata / landing_pages: lectura pública, escritura admin+catalog_editor.
create policy "seo_metadata_public_read" on seo_metadata for select using ( true );
create policy "seo_metadata_staff_write" on seo_metadata for insert
  with check ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "seo_metadata_staff_update" on seo_metadata for update
  using ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "seo_metadata_admin_delete" on seo_metadata for delete
  using ( current_role_is(array['admin']::user_role[]) );

create policy "landing_pages_public_read" on landing_pages for select
  using ( is_active or current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "landing_pages_staff_write" on landing_pages for insert
  with check ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "landing_pages_staff_update" on landing_pages for update
  using ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "landing_pages_admin_delete" on landing_pages for delete
  using ( current_role_is(array['admin']::user_role[]) );

-- redirects: gestión exclusiva de admin (no hay necesidad de lectura pública vía API,
-- Next.js los consulta con el cliente server-side en next.config o middleware).
create policy "redirects_admin_all" on redirects for all
  using ( current_role_is(array['admin']::user_role[]) );

-- =========================================================================
-- 7. Storage: bucket de imágenes de vehículos
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('vehicle-images', 'vehicle-images', true)
on conflict (id) do nothing;

create policy "vehicle_images_bucket_public_read" on storage.objects for select
  using ( bucket_id = 'vehicle-images' );
create policy "vehicle_images_bucket_staff_write" on storage.objects for insert
  with check ( bucket_id = 'vehicle-images' and current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "vehicle_images_bucket_staff_update" on storage.objects for update
  using ( bucket_id = 'vehicle-images' and current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "vehicle_images_bucket_staff_delete" on storage.objects for delete
  using ( bucket_id = 'vehicle-images' and current_role_is(array['admin','catalog_editor']::user_role[]) );
