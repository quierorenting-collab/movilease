#!/usr/bin/env python3
"""
Sube las fotos de quiero-renting/fotos/ a Supabase Storage
y actualiza main_image_url en cada vehicle de la BD.

Uso:
    python scripts/upload_images.py

Requisitos:
    pip install requests
"""

import os
import sys
import requests
from pathlib import Path
from _env import SUPABASE_URL, SERVICE_KEY

BUCKET = "vehicle-images"

# Ruta a la carpeta de fotos de quierorenting.es
FOTOS_DIR = Path(r"C:\Users\Alejandro Chumillas\quiero-renting\fotos")

BASE_HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
}


def storage_upload(filename, filepath):
    """Sube un archivo al bucket. Devuelve la URL pública."""
    with open(filepath, "rb") as f:
        content = f.read()

    ext = filepath.suffix.lstrip(".")
    mime = {
        "jpg": "image/jpeg", "jpeg": "image/jpeg",
        "png": "image/png", "webp": "image/webp",
    }.get(ext, "image/jpeg")

    r = requests.post(
        f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{filename}",
        headers={**BASE_HEADERS, "Content-Type": mime, "x-upsert": "true"},
        data=content,
    )
    if r.status_code not in (200, 201):
        print(f"  ⚠️  Error subiendo {filename}: {r.status_code} {r.text[:200]}")
        return None

    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{filename}"


def rest_get(table, params=None):
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={**BASE_HEADERS, "Content-Type": "application/json"},
        params={"select": "*", **(params or {})}
    )
    r.raise_for_status()
    return r.json()


def rest_patch(table, match_params, data):
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={**BASE_HEADERS, "Content-Type": "application/json", "Prefer": "return=minimal"},
        params=match_params,
        json=data,
    )
    if not r.ok:
        print(f"  ⚠️  PATCH error: {r.status_code} {r.text[:200]}")


# ─── COMPROBAR CARPETA ────────────────────────────────────────────────────────
if not FOTOS_DIR.exists():
    print(f"❌  Carpeta no encontrada: {FOTOS_DIR}")
    print(f"   Ajusta la variable FOTOS_DIR en este script.")
    sys.exit(1)

fotos = list(FOTOS_DIR.glob("*"))
fotos = [f for f in fotos if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")]
print(f"📂  {len(fotos)} imágenes encontradas en {FOTOS_DIR}\n")

# ─── CREAR BUCKET SI NO EXISTE ────────────────────────────────────────────────
r = requests.get(
    f"{SUPABASE_URL}/storage/v1/bucket/{BUCKET}",
    headers=BASE_HEADERS,
)
if r.status_code == 400:
    print(f"📦  Creando bucket '{BUCKET}'…")
    r2 = requests.post(
        f"{SUPABASE_URL}/storage/v1/bucket",
        headers={**BASE_HEADERS, "Content-Type": "application/json"},
        json={"id": BUCKET, "name": BUCKET, "public": True},
    )
    if r2.ok:
        print(f"  ✓  Bucket creado\n")
    else:
        print(f"  ⚠️  No se pudo crear el bucket: {r2.text}")
        print(f"      Créalo manualmente en Supabase Storage → New bucket → '{BUCKET}' (public)")
        sys.exit(1)
else:
    print(f"  ✓  Bucket '{BUCKET}' existe\n")

# ─── SUBIR IMÁGENES ───────────────────────────────────────────────────────────
uploaded = {}  # filename_stem → public_url

print("⬆️   Subiendo imágenes…")
for foto in sorted(fotos):
    url = storage_upload(foto.name, foto)
    if url:
        uploaded[foto.stem] = url
        print(f"  ✓  {foto.name}")
    else:
        print(f"  ✗  {foto.name} (error)")

print(f"\n  {len(uploaded)}/{len(fotos)} imágenes subidas\n")

# ─── ACTUALIZAR main_image_url EN LA BD ──────────────────────────────────────
print("🔗  Actualizando URLs en la base de datos…")

# Obtener todos los vehículos con sus modelos
vehicles = rest_get("vehicles", {"select": "id,model_id,main_image_url"})
models   = rest_get("models",   {"select": "id,slug"})
model_slug_by_id = {m["id"]: m["slug"] for m in models}

updated = 0
for v in vehicles:
    if v.get("main_image_url"):
        continue  # ya tiene imagen

    model_slug = model_slug_by_id.get(v["model_id"], "")
    # slug es "renting-marca-modelo", quitar "renting-" para matchear el nombre del fichero
    # ej: "renting-mg-zs" → buscar "mg-zs.*" o "mg-zs-*"
    slug_base = model_slug.replace("renting-", "")

    # Buscar coincidencia en uploaded (permite prefijo)
    match_url = None
    for stem, url in uploaded.items():
        if stem == slug_base or stem.startswith(slug_base):
            match_url = url
            break

    if match_url:
        rest_patch("vehicles", {"id": f"eq.{v['id']}"}, {"main_image_url": match_url})
        updated += 1

print(f"  ✓  {updated} vehículos actualizados con imagen\n")

# ─── RESUMEN ──────────────────────────────────────────────────────────────────
vehicles_with_img = [v for v in rest_get("vehicles") if v.get("main_image_url")]
print("━" * 50)
print(f"✅  Imágenes en BD: {len(vehicles_with_img)}/{len(vehicles)}")
print()
print("   Próximo paso: arranca el servidor y verifica el catálogo")
print("   cd Projects/movilease && npm run dev")
