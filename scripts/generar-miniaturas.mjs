/**
 * Genera la version de TARJETA de cada portada.
 *
 * Por que existe: Vercel dejo de optimizar imagenes el 09/09/2026 —se agoto la
 * cuota del plan y /_next/image devolvia 402 en toda la web—, asi que las fotos
 * se sirven tal cual desde public/. El problema de servirlas tal cual es que la
 * tarjeta del catalogo se ve a unos 400 px y se estaba bajando el fichero de
 * 1.000: 3,5 MB solo en fotos al abrir /catalogo.
 *
 * Aqui se crea, al lado de cada portada, un fichero "-card.webp" de 500 px.
 * Las tarjetas piden ese; la ficha y la galeria siguen con el grande. Medido
 * sobre las portadas actuales: un 81 % menos de peso.
 *
 * Se ejecuta solo en cada build (prebuild), para que un coche nuevo no se quede
 * sin su miniatura y la tarjeta apunte a un fichero que no existe.
 *
 *     node scripts/generar-miniaturas.mjs
 *     node scripts/generar-miniaturas.mjs --forzar   # rehace las que ya estan
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "coches-nuevos");
const ANCHO = 500;
const CALIDAD = 78;
const SUFIJO = "-card.webp";
const forzar = process.argv.includes("--forzar");

if (!fs.existsSync(DIR)) {
  console.log("  no hay public/coches-nuevos, no se genera nada");
  process.exit(0);
}

// Las portadas son las que acaban en -01.webp: son las unicas que se usan como
// imagen de tarjeta (main_image_url). El resto son galeria y no hacen falta.
const portadas = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith("-01.webp"));

let hechas = 0, saltadas = 0, ahorro = 0;
for (const f of portadas) {
  const origen = path.join(DIR, f);
  const destino = path.join(DIR, f.replace(/\.webp$/, SUFIJO));
  if (!forzar && fs.existsSync(destino) && fs.statSync(destino).mtimeMs >= fs.statSync(origen).mtimeMs) {
    saltadas++;
    continue;
  }
  const buf = await sharp(origen)
    .resize({ width: ANCHO, withoutEnlargement: true })
    .webp({ quality: CALIDAD, effort: 6 })
    .toBuffer();
  fs.writeFileSync(destino, buf);
  ahorro += fs.statSync(origen).size - buf.length;
  hechas++;
}
console.log(
  `  miniaturas: ${hechas} generadas, ${saltadas} ya estaban` +
    (hechas ? ` (${Math.round(ahorro / 1024)} KB menos que sus originales)` : "")
);
