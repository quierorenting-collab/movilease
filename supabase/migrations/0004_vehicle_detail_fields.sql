-- Ficha de vehículo completa: campos que las fichas de proveedor traen y el
-- catálogo actual no tenía (etiqueta ambiental, colores, carrocería,
-- equipamiento completo), y una tabla de cuotas por plazo/kilometraje para
-- reproducir la tabla de precios típica de una ficha de renting.

create type environmental_label as enum ('0', 'eco', 'c', 'b');

alter table vehicles
  add column if not exists environmental_label environmental_label,
  add column if not exists colors text[],
  add column if not exists body_type text,
  add column if not exists equipment text[] not null default '{}';

-- Cuotas mensuales por combinación de plazo (meses) y kilometraje anual.
-- Una fila por celda de la tabla de precios de la ficha; si un vehículo no
-- tiene filas aquí, la ficha simplemente no muestra la tabla (fallback al
-- precio único de vehicles.monthly_price_cents).
create table vehicle_pricing (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  contract_months integer not null,
  annual_km integer not null,
  monthly_price_cents integer not null check (monthly_price_cents > 0),
  created_at timestamptz not null default now(),
  unique (vehicle_id, contract_months, annual_km)
);

create index idx_vehicle_pricing_vehicle_id on vehicle_pricing(vehicle_id);

alter table vehicle_pricing enable row level security;

create policy "vehicle_pricing_public_read" on vehicle_pricing for select using ( true );
create policy "vehicle_pricing_staff_write" on vehicle_pricing for insert
  with check ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "vehicle_pricing_staff_update" on vehicle_pricing for update
  using ( current_role_is(array['admin','catalog_editor']::user_role[]) );
create policy "vehicle_pricing_admin_delete" on vehicle_pricing for delete
  using ( current_role_is(array['admin']::user_role[]) );

-- Igual que en 0002_grants.sql: RLS no sustituye al GRANT de tabla.
grant select on vehicle_pricing to anon;
grant select, insert, update, delete on vehicle_pricing to authenticated, service_role;
