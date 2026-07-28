-- Datos de ejemplo para desarrollo local. Sin datos reales de clientes ni
-- del catálogo real — solo para comprobar que el esquema funciona de
-- extremo a extremo antes de cargar el catálogo real en la Fase 2.

insert into brands (name, slug) values
  ('SEAT', 'seat'),
  ('Toyota', 'toyota'),
  ('Renault', 'renault')
on conflict (slug) do nothing;

insert into models (brand_id, name, slug, description)
select b.id, m.name, m.slug, m.description
from (values
  ('seat', 'Ibiza', 'renting-seat-ibiza', 'Compacto ideal para ciudad.'),
  ('toyota', 'Corolla', 'renting-toyota-corolla', 'Híbrido de referencia en su segmento.'),
  ('renault', 'Captur', 'renting-renault-captur', 'SUV compacto con motorización electrificada.')
) as m(brand_slug, name, slug, description)
join brands b on b.slug = m.brand_slug
on conflict (slug) do nothing;

insert into vehicles (
  model_id, version, version_slug, category, fuel_type, transmission,
  monthly_price_cents, horsepower, consumption_value, seats, doors,
  is_featured, is_offer, badge_text
)
select mo.id, v.version, v.version_slug, v.category::vehicle_category, v.fuel_type::fuel_type,
       v.transmission::transmission_type, v.monthly_price_cents, v.horsepower,
       v.consumption_value, v.seats, v.doors, v.is_featured, v.is_offer, v.badge_text
from (values
  ('renting-seat-ibiza', '1.0 MPI 80CV', '1-0-mpi-80cv', 'turismo', 'gasolina', 'manual',
    26400, 80, 5.5, 5, 5, false, false, null),
  ('renting-toyota-corolla', '1.8 HEV 140CV', '1-8-hev-140cv', 'hibrido', 'hibrido', 'automatico',
    39900, 140, 4.2, 5, 5, true, false, 'Híbrido'),
  ('renting-renault-captur', 'E-Tech Full Hybrid 145CV', 'e-tech-full-hybrid-145cv', 'suv', 'hibrido', 'automatico',
    40900, 145, 4.5, 5, 5, false, true, 'Oferta')
) as v(model_slug, version, version_slug, category, fuel_type, transmission,
       monthly_price_cents, horsepower, consumption_value, seats, doors,
       is_featured, is_offer, badge_text)
join models mo on mo.slug = v.model_slug
on conflict (model_id, version_slug) do nothing;

insert into landing_pages (type, slug, title, h1, intro_content, meta_description)
values
  ('category', 'renting-suv', 'Renting de SUV', 'Renting de SUV para particulares',
   'Los mejores SUV en renting, sin entrada y con todo incluido.',
   'Renting de SUV para particulares desde el mejor precio, sin entrada y con todo incluido.'),
  ('category', 'renting-electrico', 'Renting de coches eléctricos', 'Renting de coches eléctricos',
   'Estrena un coche eléctrico sin preocuparte del mantenimiento ni el seguro.',
   'Renting de coches eléctricos para particulares, cuota fija todo incluido.'),
  ('city', 'renting-coches-madrid', 'Renting de coches en Madrid', 'Renting de coches en Madrid',
   'Renting de coches para particulares en Madrid, entrega rápida.',
   'Renting de coches en Madrid sin entrada, todo incluido y gestión en 48h.')
on conflict (slug) do nothing;
