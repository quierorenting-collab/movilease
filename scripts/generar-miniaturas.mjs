/**
 * Genera las versiones reducidas de cada portada.
 *
 * Por que existe: Vercel dejo de optimizar imagenes el 09/09/2026 —se agoto la
 * cuota del plan y /_next/image devolvia 402 en toda la web—, asi que las fotos
 * se sirven tal cual desde public/. El problema de servirlas tal cual es que la
 * tarjeta del catalogo se ve a unos 400 px y se estaba bajando el fichero de
 * 1.000: 3,5 MB solo en fotos al abrir /catalogo.
 *
 * Aqui se crean, al lado de cada portada, dos ficheros mas pequenos:
 *
 *   -card.webp  500 px  → la tarjeta del catalogo y de la home, que se ve a
 *                         unos 330 px. Medido sobre las portadas actuales:
 *                         un 81 % menos de peso.
 *   -hero.webp  800 px  → la foto grande de la ficha. Se ve a unos 330 px en
 *                         movil y a 568 en escritorio, asi que cubre las dos
 *                         con holgura salvo en pantallas de mucha densidad,
 *                         donde el navegador se baja la original por su cuenta
 *                         (la ficha usa srcset nativo, no elige nadie por el).
 *
 * La galeria (fotos 02, 03…) se queda con el fichero original: solo se reducen
 * las portadas -01, que son las unicas que se piden en pequeno.
 *
 * Se ejecuta solo en cada build (prebuild), para que un coche nuevo no se quede
 * sin sus versiones y la tarjeta apunte a un fichero que no existe.
 *
 *     node scripts/generar-miniaturas.mjs
 *     node scripts/generar-miniaturas.mjs --forzar   # rehace las que ya estan
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "coches-nuevos");
const MEDIDAS = [
  { sufijo: "-card.webp", ancho: 500, calidad: 78 },
  { sufijo: "-hero.webp", ancho: 800, calidad: 80 },
];
const forzar = process.argv.includes("--forzar");

if (!fs.existsSync(DIR)) {
  console.log("  miniaturas: no hay carpeta public/coches-nuevos, nada que hacer");
  process.exit(0);
}

/* Solo las portadas: son las unicas que se piden en tamano pequeno. Y hay que
   excluir explicitamente las que ya son generadas, o en la segunda pasada se
   generaria la miniatura de la miniatura. */
const portadas = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith("-01.webp"))
  .sort();

let hechas = 0;
let saltadas = 0;
let peso = 0;

for (const f of portadas) {
  const origen = path.join(DIR, f);
  for (const m of MEDIDAS) {
    const destino = path.join(DIR, f.slice(0, -".webp".length) + m.sufijo);
    if (
      !forzar &&
      fs.existsSync(destino) &&
      fs.statSync(destino).mtimeMs >= fs.statSync(origen).mtimeMs
    ) {
      saltadas++;
      continue;
    }
    const buf = await sharp(origen)
      .resize({ width: m.ancho, withoutEnlargement: true })
      .webp({ quality: m.calidad, effort: 6 })
      .toBuffer();
    fs.writeFileSync(destino, buf);
    peso += buf.length;
    hechas++;
  }
}

console.log(
  `  miniaturas: ${hechas} generadas (${Math.round(peso / 1024)} KB), ${saltadas} ya estaban`,
);
