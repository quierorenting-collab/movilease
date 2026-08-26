-- SEAT León 1.5 TSI FR Special Edition
-- Generado con scripts/ficha_a_sql.py desde scripts/fichas/seat-leon-15-tsi-fr-special-edition.json
-- Pegar entero en el SQL Editor de Supabase. Se puede repetir sin duplicar.

begin;

insert into brands (name, slug) values ('SEAT', 'seat')
  on conflict (slug) do nothing;

insert into models (brand_id, name, slug)
  select b.id, 'León', 'renting-seat-leon' from brands b where b.slug = 'seat'
  on conflict (slug) do nothing;

insert into vehicles (model_id, version, version_slug, category, fuel_type, transmission, monthly_price_cents, contract_months, annual_km, horsepower, seats, doors, main_image_url, short_description, description, environmental_label, body_type, colors, equipment, included_services)
  select m.id, '1.5 TSI FR Special Edition', '1-5-tsi-fr-special-edition', 'turismo', 'gasolina', 'manual', 35800, 48, 10000, 150, 5, 5, '/coches-nuevos/seat-leon-fr-01.webp', 'Acabado FR Special Edition con motor 1.5 TSI de 150 CV', E'Acabado FR Special Edition: llantas de 18", suspensión deportiva y detalles exteriores FR.\nMotor 1.5 TSI de 150 CV con cambio manual.\nEtiqueta ambiental C: libertad para moverte por la ciudad.\nCompacto de 5 plazas y 5 puertas, con pantalla grande y modos de conducción.\nTodo incluido en una única cuota mensual.', 'c', 'Hatchback', array['Gris Grafeno', 'Gris Magnetic', 'Negro Metalizado', 'Rojo Metalizado'], array['Llantas de 18"', 'Suspensión deportiva', 'Volante deportivo', 'Iluminación ambiental', 'Pantalla grande', 'Modos de conducción', 'Detalles exteriores FR'], array['Seguro a todo riesgo', 'Mantenimiento y revisiones', 'Neumáticos incluidos', 'Asistencia 24h', 'Averías y reparaciones', 'ITV e impuestos', 'Gestión de multas', 'Entrega a domicilio', 'Cambio de neumáticos'] from models m where m.slug = 'renting-seat-leon'
  on conflict (model_id, version_slug) do nothing;

insert into vehicle_pricing (vehicle_id, contract_months, annual_km, monthly_price_cents)
  select v.id, p.contract_months, p.annual_km, p.monthly_price_cents
  from vehicles v
  join models m on m.id = v.model_id
  cross join (values
    (36, 10000, 35900),
    (36, 15000, 38800),
    (36, 20000, 41300),
    (48, 10000, 35800),
    (48, 15000, 37700),
    (48, 20000, 40300)
  ) as p(contract_months, annual_km, monthly_price_cents)
  where m.slug = 'renting-seat-leon' and v.version_slug = '1-5-tsi-fr-special-edition'
  on conflict (vehicle_id, contract_months, annual_km)
  do update set monthly_price_cents = excluded.monthly_price_cents;

insert into vehicle_images (vehicle_id, storage_path, alt_text, sort_order, is_primary)
  select v.id, f.url, f.alt, f.orden, f.orden = 0
  from vehicles v
  join models m on m.id = v.model_id
  cross join (values
    (0, '/coches-nuevos/seat-leon-fr-01.webp', 'SEAT León FR en renting — vista exterior delantera'),
    (1, '/coches-nuevos/seat-leon-fr-02.webp', 'SEAT León FR en renting — vista exterior trasera'),
    (2, '/coches-nuevos/seat-leon-fr-03.webp', 'SEAT León FR en renting — perfil lateral'),
    (3, '/coches-nuevos/seat-leon-fr-04.webp', 'SEAT León FR en renting — frontal'),
    (4, '/coches-nuevos/seat-leon-fr-05.webp', 'SEAT León FR en renting — trasera'),
    (5, '/coches-nuevos/seat-leon-fr-06.webp', 'SEAT León FR en renting — interior y puesto de conducción'),
    (6, '/coches-nuevos/seat-leon-fr-07.webp', 'SEAT León FR en renting — maletero')
  ) as f(orden, url, alt)
  where m.slug = 'renting-seat-leon' and v.version_slug = '1-5-tsi-fr-special-edition'
  -- Sin clave única en vehicle_images: se corta por vehículo ya con galería.
  and not exists (select 1 from vehicle_images vi where vi.vehicle_id = v.id);

commit;

-- Comprobación: select count(*) from vehicles v join models m on m.id = v.model_id where m.slug = 'renting-seat-leon';
-- Queda publicado en https://movilease.es/renting-seat-leon

