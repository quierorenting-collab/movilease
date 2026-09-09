# movilease.es

Renting de coches. **Next.js 15 (App Router) + Supabase**, desplegada en Vercel.

La documentación de verdad está en otro sitio y hay que leerla antes de tocar
nada; esto es solo la portada:

| Documento | Para qué |
|---|---|
| [`docs/CONTEXTO-MAESTRO.md`](docs/CONTEXTO-MAESTRO.md) | **Empieza aquí.** Cómo funciona todo, qué no se debe romper y por qué. |
| [`docs/HANDOFF-MAESTRO.md`](docs/HANDOFF-MAESTRO.md) | La versión larga: historial de decisiones e inventario componente a componente. |
| [`AGENTS.md`](AGENTS.md) | Este no es el Next.js que recuerdas: `cookies()`, `headers()` y `params` son asíncronos. |

## Comandos

```bash
npm install      # obligatorio en sesión nueva: node_modules no viene en el repo
npm run dev      # http://localhost:3000
npm run lint     # tiene que salir limpio
npm run build    # tiene que compilar
```

Sin `.env.local` la web arranca igual: la capa de datos nunca lanza, así que el
catálogo sale vacío pero el diseño se ve entero. Suficiente para maquetar.

## Cómo se publica

**Haciendo push a `master`.** El repositorio está conectado al proyecto
`movilease` de Vercel, que construye y publica solo. Cualquier otra rama sale
como vista previa con su propia URL.

**Publicar un coche NO es desplegar.** El catálogo vive en Supabase, no en el
código, así que un coche nuevo no aparece por hacer push:

```bash
python scripts/add_vehicle.py scripts/fichas/<coche>.json
curl -X POST https://movilease.es/api/revalidate \
  -H "x-revalidate-secret: <REVALIDATE_SECRET>" \
  -H "Content-Type: application/json" -d '{"path":"/catalogo"}'
```

El procedimiento completo, con las reglas de precio y el aviso de `annual_km`,
está en el §7.1 del contexto maestro.

## Dos trampas de las fotos

Las dos vienen de que **Vercel dejó de optimizar imágenes el 09/09/2026**: se
agotó la cuota del plan, `/_next/image` empezó a devolver 402 y la web se quedó
entera sin fotos.

1. **`next.config.ts` lleva `images: { unoptimized: true }`.** No lo quites sin
   comprobar antes que la cuenta vuelve a tener cuota, o la web se queda otra
   vez sin una sola foto.
2. **Las versiones reducidas se generan en el build**, con el `prebuild` que
   llama a `scripts/generar-miniaturas.mjs`: por cada portada `-01.webp` deja un
   `-card.webp` de 500 px para las tarjetas y un `-hero.webp` de 800 px para la
   foto grande de la ficha. Si alguna vez se salta ese paso, las tarjetas
   apuntan a ficheros que no existen.

## Secretos

Ninguno vive en el repositorio, y tiene que seguir siendo así: **es público**.
`.env.local` está en `.gitignore` y los valores reales están en Vercel. La
plantilla de las variables, sin valores, está en `.env.example`.
