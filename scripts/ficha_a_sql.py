"""Convierte una ficha JSON en el SQL de alta, para pegar en el editor de
Supabase.

`add_vehicle.py` es la vía normal, pero necesita `.env.local` con la service
role. Cuando no se tiene a mano (una sesión remota, un portátil prestado), esto
genera el mismo alta en SQL y basta con pegarlo en el SQL Editor del proyecto,
igual que se hizo con la siembra inicial.

    python scripts/ficha_a_sql.py scripts/fichas/<coche>.json > supabase/alta.sql

El SQL es idempotente: se puede ejecutar dos veces sin duplicar nada. Las
cuotas se actualizan si cambian; las fotos sólo se insertan si el vehículo aún
no tiene ninguna, para no acumular galerías repetidas.
"""

import json
import re
import sys
import unicodedata


def slugify(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def lit(value):
    """Literal SQL. Las comillas simples se duplican; los saltos de línea van
    en cadena E'' para que no dependan del formato del editor."""
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    escaped = value.replace("\\", "\\\\").replace("'", "''")
    if "\n" in escaped:
        return "E'" + escaped.replace("\n", "\\n") + "'"
    return "'" + escaped + "'"


def arr(values):
    return "array[" + ", ".join(lit(v) for v in values) + "]"


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Uso: python scripts/ficha_a_sql.py <ficha.json>")

    with open(sys.argv[1], encoding="utf-8") as f:
        d = json.load(f)

    brand, model, version = d["brand"], d["model"], d["version"]
    brand_slug = slugify(brand)
    model_slug = f"renting-{brand_slug}-{slugify(model)}"
    version_slug = slugify(version)
    images = d.get("images", [])
    main_image = images[0]["url"] if images else d.get("main_image_url")

    # Columna -> valor. Se omite lo que la ficha no trae: la web oculta sola
    # los campos sin dato, y un null explícito pisaría un valor ya cargado.
    campos = {
        "version": version,
        "version_slug": version_slug,
        "category": d["category"],
        "fuel_type": d["fuel_type"],
        "transmission": d["transmission"],
        "monthly_price_cents": d["monthly_price_cents"],
        "contract_months": d.get("contract_months", 36),
        "annual_km": d.get("annual_km", 15000),
        "horsepower": d.get("horsepower"),
        "consumption_value": d.get("consumption_value"),
        "consumption_unit": d.get("consumption_unit"),
        "seats": d.get("seats"),
        "doors": d.get("doors"),
        "main_image_url": main_image,
        "is_featured": d.get("is_featured"),
        "is_offer": d.get("is_offer"),
        "badge_text": d.get("badge_text"),
        "short_description": d.get("short_description"),
        "description": d.get("description"),
        "environmental_label": d.get("environmental_label"),
        "body_type": d.get("body_type"),
    }
    campos = {k: v for k, v in campos.items() if v is not None}
    valores = {k: lit(v) for k, v in campos.items()}
    for k in ("colors", "equipment", "included_services"):
        if d.get(k):
            valores[k] = arr(d[k])

    cols = ", ".join(valores)
    vals = ", ".join(valores.values())

    out = [
        f"-- {brand} {model} {version}",
        f"-- Generado con scripts/ficha_a_sql.py desde {sys.argv[1]}",
        "-- Pegar entero en el SQL Editor de Supabase. Se puede repetir sin duplicar.",
        "",
        "begin;",
        "",
        f"insert into brands (name, slug) values ({lit(brand)}, {lit(brand_slug)})",
        "  on conflict (slug) do nothing;",
        "",
        "insert into models (brand_id, name, slug)",
        f"  select b.id, {lit(model)}, {lit(model_slug)} from brands b where b.slug = {lit(brand_slug)}",
        "  on conflict (slug) do nothing;",
        "",
        f"insert into vehicles (model_id, {cols})",
        f"  select m.id, {vals} from models m where m.slug = {lit(model_slug)}",
        "  on conflict (model_id, version_slug) do nothing;",
    ]

    if d.get("pricing"):
        filas = ",\n".join(
            f"    ({p['contract_months']}, {p['annual_km']}, {p['monthly_price_cents']})"
            for p in d["pricing"]
        )
        out += [
            "",
            "insert into vehicle_pricing (vehicle_id, contract_months, annual_km, monthly_price_cents)",
            "  select v.id, p.contract_months, p.annual_km, p.monthly_price_cents",
            "  from vehicles v",
            "  join models m on m.id = v.model_id",
            "  cross join (values",
            filas,
            "  ) as p(contract_months, annual_km, monthly_price_cents)",
            f"  where m.slug = {lit(model_slug)} and v.version_slug = {lit(version_slug)}",
            "  on conflict (vehicle_id, contract_months, annual_km)",
            "  do update set monthly_price_cents = excluded.monthly_price_cents;",
        ]

    if images:
        filas = ",\n".join(
            f"    ({i}, {lit(img['url'])}, {lit(img.get('alt'))})" for i, img in enumerate(images)
        )
        out += [
            "",
            "insert into vehicle_images (vehicle_id, storage_path, alt_text, sort_order, is_primary)",
            "  select v.id, f.url, f.alt, f.orden, f.orden = 0",
            "  from vehicles v",
            "  join models m on m.id = v.model_id",
            "  cross join (values",
            filas,
            "  ) as f(orden, url, alt)",
            f"  where m.slug = {lit(model_slug)} and v.version_slug = {lit(version_slug)}",
            "  -- Sin clave única en vehicle_images: se corta por vehículo ya con galería.",
            "  and not exists (select 1 from vehicle_images vi where vi.vehicle_id = v.id);",
        ]

    out += [
        "",
        "commit;",
        "",
        f"-- Comprobación: select count(*) from vehicles v join models m on m.id = v.model_id where m.slug = {lit(model_slug)};",
        f"-- Queda publicado en https://movilease.es/{model_slug}",
        "",
    ]
    print("\n".join(out))


if __name__ == "__main__":
    main()
