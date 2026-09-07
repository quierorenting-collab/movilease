/**
 * Deja todos los logos de marca con el mismo peso visual.
 *
 * El problema no era el tamaño del hueco sino los ficheros: cada logo venía con
 * sus propios márgenes y su propia proporción, así que en la misma caja de 28x24
 * el escudo de Alfa Romeo llenaba el hueco y el logotipo alargado de Ebro salía
 * diminuto. Parecía un catálogo mal montado.
 *
 * Igualarlos por ALTURA tampoco vale: un escudo redondo de 24 px de alto pesa
 * mucho más que unas letras de 24 px de alto. Lo que se iguala aquí es el ÁREA
 * DE TINTA —los píxeles que no son fondo—, que es como el ojo mide "cuánto
 * ocupa" un logo. Un escudo acaba más pequeño de alto que un logotipo largo, y
 * es justo lo que hace falta para que se vean parejos.
 *
 *     node scripts/normalizar-logos-marca.mjs          # escribe
 *     node scripts/normalizar-logos-marca.mjs --ensayo # solo informa
 *
 * Las fuentes viven en public/brands/_origen/ (copia intacta de lo que había).
 * El resultado son PNG de 240x120 con fondo transparente, que cubre 3x el
 * tamaño al que se muestran.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "brands");
const ORIGEN = path.join(DIR, "_origen");
const ANCHO = 240;
const ALTO = 120;
/** Fracción del lienzo que debe ocupar la tinta. Medido a ojo sobre el
 *  resultado: por debajo de 0,16 se ven flojos y por encima de 0,24 los
 *  logotipos largos se comen la caja. */
const AREA_OBJETIVO = 0.2;
const ensayo = process.argv.includes("--ensayo");

/** Recorta el margen vacío, sea transparente o blanco. */
async function recortar(buffer) {
  const { data, info } = await sharp(buffer, { limitInputPixels: false })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let x0 = width, y0 = height, x1 = 0, y1 = 0, tinta = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      // Fondo = transparente o casi blanco. Lo demás es tinta.
      if (a < 24 || (r > 244 && g > 244 && b > 244)) continue;
      tinta++;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  if (tinta === 0) return null;
  return { x0, y0, ancho: x1 - x0 + 1, alto: y1 - y0 + 1, tinta, width, height };
}

async function main() {
  if (!fs.existsSync(ORIGEN)) fs.mkdirSync(ORIGEN);
  const ficheros = fs
    .readdirSync(DIR)
    .filter((f) => /\.(svg|png|jpg|jpeg|webp)$/i.test(f));

  for (const f of ficheros) {
    const guardado = path.join(ORIGEN, f);
    if (!fs.existsSync(guardado)) fs.copyFileSync(path.join(DIR, f), guardado);
  }

  const fuentes = fs.readdirSync(ORIGEN).filter((f) => /\.(svg|png|jpg|jpeg|webp)$/i.test(f));
  const informe = [];

  for (const f of fuentes) {
    const base = path.basename(f, path.extname(f));
    const bruto = fs.readFileSync(path.join(ORIGEN, f));
    // Los SVG se rasterizan grandes para que el recorte sea preciso.
    // limitInputPixels: un SVG a 600 dpi puede rasterizarse enorme y sharp se
    // niega por seguridad. Aqui la fuente es un logo, no una foto de usuario.
    const grande = await sharp(bruto, { density: 300, limitInputPixels: false })
      .resize({ width: 1200, height: 600, fit: "inside", withoutEnlargement: false })
      .png()
      .toBuffer();

    const caja = await recortar(grande);
    if (!caja) {
      informe.push({ base, nota: "sin tinta, se salta" });
      continue;
    }

    const recortado = await sharp(grande)
      .extract({ left: caja.x0, top: caja.y0, width: caja.ancho, height: caja.alto })
      .toBuffer();

    // Escala para que la tinta ocupe AREA_OBJETIVO del lienzo, sin salirse.
    const densidad = caja.tinta / (caja.ancho * caja.alto);
    const areaDeseada = ANCHO * ALTO * AREA_OBJETIVO;
    let escala = Math.sqrt(areaDeseada / (caja.ancho * caja.alto * densidad));
    const limite = Math.min((ANCHO * 0.94) / caja.ancho, (ALTO * 0.94) / caja.alto);
    escala = Math.min(escala, limite);

    const w = Math.max(1, Math.round(caja.ancho * escala));
    const h = Math.max(1, Math.round(caja.alto * escala));

    const salida = await sharp({
      create: { width: ANCHO, height: ALTO, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([
        {
          input: await sharp(recortado).resize(w, h, { fit: "fill" }).toBuffer(),
          left: Math.round((ANCHO - w) / 2),
          top: Math.round((ALTO - h) / 2),
        },
      ])
      .png({ compressionLevel: 9 })
      .toBuffer();

    informe.push({
      base,
      origen: `${caja.ancho}x${caja.alto}`,
      final: `${w}x${h}`,
      tinta: `${(densidad * 100).toFixed(0)}%`,
      kb: Math.round(salida.length / 1024),
    });

    if (!ensayo) {
      fs.writeFileSync(path.join(DIR, `${base}.png`), salida);
      const svg = path.join(DIR, `${base}.svg`);
      if (fs.existsSync(svg)) fs.unlinkSync(svg);
    }
  }

  informe.sort((a, b) => a.base.localeCompare(b.base));
  for (const r of informe) {
    console.log(
      r.nota
        ? `  ${r.base.padEnd(16)} ${r.nota}`
        : `  ${r.base.padEnd(16)} ${String(r.origen).padEnd(12)} -> ${String(r.final).padEnd(10)} tinta ${r.tinta.padStart(4)}  ${r.kb} KB`
    );
  }
  console.log(`\n  ${informe.length} logos${ensayo ? " (ensayo, no se ha escrito nada)" : " normalizados a 240x120"}`);
}

main();
