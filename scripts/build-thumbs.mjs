/**
 * Genera la miniatura -thumb.webp (192 px) de cada foto de coche.
 *
 * La tira de miniaturas de la ficha pintaba cajas de 96x64 px descargando el
 * fichero entero: en la del Opel Corsa eran 172 KB en nueve fotos para algo que
 * ocupa menos que un icono. Y `sizes="96px"` no servía de nada porque
 * next.config.ts declara `unoptimized: true`: next/image no redimensiona, así
 * que la única salida es tener ficheros pequeños de verdad.
 *
 * 192 px y no 160: es el doble exacto de la caja de 96, así que se ve nítida en
 * móviles de alta densidad, y la diferencia de peso entre las dos es de unos
 * 6 KB en toda la galería.
 *
 *   node scripts/build-thumbs.mjs           # solo las que faltan
 *   node scripts/build-thumbs.mjs --todas   # rehace todas
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = path.join(process.cwd(), "public", "coches-nuevos");
const ANCHO = 192;
const TODAS = process.argv.includes("--todas");

/* Las variantes ya generadas no tienen miniatura propia: -card y -hero salen de
   la misma portada y -thumb es esta misma. */
const ES_VARIANTE = /-(card|hero|thumb)\.webp$/;

const ficheros = (await readdir(DIR)).filter((f) => f.endsWith(".webp") && !ES_VARIANTE.test(f));
let hechas = 0;
let saltadas = 0;
let bytesAntes = 0;
let bytesDespues = 0;

for (const f of ficheros) {
  const destino = path.join(DIR, f.replace(/\.webp$/, "-thumb.webp"));
  const origen = path.join(DIR, f);
  if (!TODAS) {
    try {
      await stat(destino);
      saltadas += 1;
      continue;
    } catch {
      /* no existe: se genera */
    }
  }
  const { size: antes } = await stat(origen);
  await sharp(origen).resize({ width: ANCHO, withoutEnlargement: true }).webp({ quality: 72 }).toFile(destino);
  const { size: despues } = await stat(destino);
  bytesAntes += antes;
  bytesDespues += despues;
  hechas += 1;
}

const kb = (n) => (n / 1024).toFixed(1) + " KB";
console.log(`miniaturas generadas: ${hechas} (ya estaban: ${saltadas})`);
if (hechas) {
  console.log(`  ${kb(bytesAntes)} -> ${kb(bytesDespues)} (${Math.round((1 - bytesDespues / bytesAntes) * 100)} % menos)`);
}
