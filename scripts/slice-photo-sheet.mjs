/**
 * Trocea las hojas de contacto "FOTOS <coche>.png" del Drive en fotos sueltas.
 *
 * Las hojas son mejores que cualquier foto de banco: llevan el color real que
 * se contrata, matrícula MoviLease y calidad de estudio. Pero vienen como un
 * único PNG de 1536x1024 con seis u ocho vistas montadas, así que hay que
 * separarlas antes de subirlas.
 *
 * El montaje no es idéntico en todas las hojas (la calle entre viñetas cae en
 * columnas distintas), así que en vez de coordenadas fijas se detectan las
 * calles: una calle es una columna o fila de color prácticamente constante de
 * lado a lado. Con eso el recorte se adapta a cada hoja.
 *
 *   node scripts/slice-photo-sheet.mjs "<ruta hoja.png>" <prefijo-salida>
 */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const [, , origen, prefijo] = process.argv;
if (!origen || !prefijo) {
  console.error('Uso: node scripts/slice-photo-sheet.mjs "<hoja.png>" <prefijo>');
  process.exit(1);
}

const SALIDA = path.resolve("public/coches-nuevos");
fs.mkdirSync(SALIDA, { recursive: true });

const TOL = 10; // margen de ruido de compresión al comparar píxeles
const MIN_LADO = 200; // por debajo de esto no es una viñeta, es un resto de calle

const { data, info } = await sharp(origen).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const px = (x, y) => {
  const i = (y * W + x) * C;
  return [data[i], data[i + 1], data[i + 2]];
};
const igual = (a, b) =>
  Math.abs(a[0] - b[0]) <= TOL && Math.abs(a[1] - b[1]) <= TOL && Math.abs(a[2] - b[2]) <= TOL;

/**
 * Una calle no siempre es de color perfectamente uniforme: en las hojas de
 * coches oscuros la línea separadora tiene uno o dos píxeles de antialias
 * donde toca cada viñeta, y exigir uniformidad total no detectaba ninguna.
 * Basta con que la inmensa mayoría de la línea sea del mismo color.
 */
const FALLOS = 0.015;

const columnaConstante = (x, y0, y1) => {
  const c0 = px(x, Math.floor((y0 + y1) / 2));
  let malos = 0;
  const tope = (y1 - y0 + 1) * FALLOS;
  for (let y = y0; y <= y1; y++) if (!igual(px(x, y), c0) && ++malos > tope) return false;
  return true;
};
const filaConstante = (y, x0, x1) => {
  const c0 = px(Math.floor((x0 + x1) / 2), y);
  let malos = 0;
  const tope = (x1 - x0 + 1) * FALLOS;
  for (let x = x0; x <= x1; x++) if (!igual(px(x, y), c0) && ++malos > tope) return false;
  return true;
};

/** Agrupa índices consecutivos en tramos [inicio, fin]. */
const tramos = (lista) => {
  const out = [];
  let ini = null;
  let prev = null;
  for (const v of lista) {
    if (ini === null) { ini = prev = v; continue; }
    if (v === prev + 1) { prev = v; continue; }
    out.push([ini, prev]);
    ini = prev = v;
  }
  if (ini !== null) out.push([ini, prev]);
  return out;
};

/** Convierte las calles en los intervalos de contenido que quedan entre ellas. */
const bloques = (calles, min, max) => {
  const out = [];
  let cursor = min;
  for (const [a, b] of calles) {
    if (a - cursor >= MIN_LADO) out.push([cursor, a - 1]);
    cursor = b + 1;
  }
  if (max - cursor >= MIN_LADO) out.push([cursor, max]);
  return out;
};

// Marco exterior: las hojas traen unos píxeles de borde del mismo color.
let x0 = 0, x1 = W - 1, y0 = 0, y1 = H - 1;
while (x0 < W && columnaConstante(x0, 0, H - 1)) x0++;
while (x1 > x0 && columnaConstante(x1, 0, H - 1)) x1--;
while (y0 < H && filaConstante(y0, x0, x1)) y0++;
while (y1 > y0 && filaConstante(y1, x0, x1)) y1--;

// Corte horizontal principal: separa el bloque grande de la tira inferior.
const callesH = tramos(
  Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i).filter((y) => filaConstante(y, x0, x1))
);
const filas = bloques(callesH, y0, y1);

const recortes = [];
for (const [fa, fb] of filas) {
  const callesV = tramos(
    Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i).filter((x) => columnaConstante(x, fa, fb))
  );
  const cols = bloques(callesV, x0, x1);
  for (const [ca, cb] of cols) {
    // Dentro de una columna puede haber a su vez una calle horizontal propia
    // (en estas hojas, la columna derecha lleva dos vistas apiladas).
    const sub = tramos(
      Array.from({ length: fb - fa + 1 }, (_, i) => fa + i).filter((y) => filaConstante(y, ca, cb))
    );
    const partes = bloques(sub, fa, fb);
    for (const [pa, pb] of partes.length ? partes : [[fa, fb]]) {
      recortes.push({ left: ca, top: pa, width: cb - ca + 1, height: pb - pa + 1 });
    }
  }
}

/**
 * Segunda pasada. En un par de hojas la calle interior es tan tenue que la
 * primera pasada no la ve y salen dos vistas pegadas en una sola imagen (el
 * CR-V traía la trasera y el perfil apilados). Aquí se vuelve a mirar dentro
 * de cada recorte con el listón más bajo, que es seguro porque ya sabemos que
 * lo que hay dentro es contenido y no marco.
 */
const FALLOS_INTERIOR = 0.05;
const partirDeNuevo = (r) => {
  const constante = (fijo, a, b, esFila) => {
    const c0 = esFila ? px(Math.floor((a + b) / 2), fijo) : px(fijo, Math.floor((a + b) / 2));
    let malos = 0;
    const tope = (b - a + 1) * FALLOS_INTERIOR;
    for (let v = a; v <= b; v++) {
      const c = esFila ? px(v, fijo) : px(fijo, v);
      if (!igual(c, c0) && ++malos > tope) return false;
    }
    return true;
  };
  const x2 = r.left + r.width - 1;
  const y2 = r.top + r.height - 1;
  for (const esFila of [true, false]) {
    const ini = esFila ? r.top : r.left;
    const fin = esFila ? y2 : x2;
    const a = esFila ? r.left : r.top;
    const b = esFila ? x2 : y2;
    const calles = tramos(
      Array.from({ length: fin - ini + 1 }, (_, i) => ini + i).filter((v) => constante(v, a, b, esFila))
    );
    const partes = bloques(calles, ini, fin);
    if (partes.length >= 2) {
      return partes.map(([p, q]) =>
        esFila
          ? { left: r.left, top: p, width: r.width, height: q - p + 1 }
          : { left: p, top: r.top, width: q - p + 1, height: r.height }
      );
    }
  }
  return [r];
};
recortes.splice(0, recortes.length, ...recortes.flatMap(partirDeNuevo));

// Orden de lectura (arriba->abajo, izquierda->derecha). Ordenar por tamaño
// parecía más cómodo —la viñeta grande primero— pero deja el resto en un orden
// que cambia con cada hoja, y de ahí salen los textos alternativos. En orden de
// lectura la posición de cada vista es la misma en todas las hojas.
recortes.sort((a, b) => (a.top - b.top) || (a.left - b.left));

let n = 0;
for (const r of recortes) {
  const destino = path.join(SALIDA, `${prefijo}-${String(++n).padStart(2, "0")}.webp`);
  await sharp(origen)
    .extract(r)
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(destino);
  console.log(`  ${path.basename(destino)}  ${r.width}x${r.height}`);
}
console.log(`${prefijo}: ${n} fotos`);
