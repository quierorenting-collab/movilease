/**
 * Escribe el bloque "images" de cada ficha a partir de las fotos ya recortadas
 * en public/coches-nuevos.
 *
 * El texto alternativo no se puede sacar del nombre del archivo porque el orden
 * de las vistas cambia de una hoja a otra. Sí es constante el MONTAJE: arriba
 * van las vistas de tres cuartos y el perfil, y abajo una tira de cuatro con
 * dos exteriores frontales/traseros y dos de interior.
 *
 * Lo que sí distingue una carrocería de un habitáculo es cuánto fondo de
 * estudio se ve alrededor. Se mide eso y se corta por el salto más grande
 * DENTRO de cada coche, no con un número fijo: el CR-V está fotografiado sobre
 * un plató oscuro y con umbral fijo salían sus siete fotos como interior.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DIR = "public/coches-nuevos";

/** Devuelve [{url, alt}] listo para meter en la ficha. */
export async function galeria(prefijo, nombreCoche, excluir = []) {
  const files = fs
    .readdirSync(DIR)
    // El prefijo tiene que casar con el número, no sólo con el principio:
    // "toyota-yaris" también empieza "toyota-yaris-cross" y se colaban las
    // catorce fotos de los dos coches en la misma galería.
    .filter((f) => /^(.*)-(\d+)\.webp$/.exec(f)?.[1] === prefijo)
    .filter((f) => !excluir.includes(f))
    .sort();

  const metas = [];
  for (const f of files) {
    const img = sharp(path.join(DIR, f));
    const { width, height } = await img.metadata();
    // Señal: cuánta foto ocupa el fondo claro del estudio. Todas las vistas de
    // carrocería están hechas sobre ciclorama gris claro, así que siempre
    // tienen mucho píxel casi blanco alrededor del coche; un habitáculo no
    // tiene ninguno. El brillo medio no sirve —un CR-V negro de exterior es
    // más oscuro que el interior claro de otro coche— pero esto sí, porque no
    // mide el coche, mide el fondo.
    const { data, info } = await img
      .resize(120, 80, { fit: "fill" })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let claros = 0;
    for (let i = 0; i < data.length; i += info.channels) if (data[i] > 190) claros++;
    metas.push({ f, width, height, ar: width / height, fondo: claros / (data.length / info.channels) });
  }

  // El perfil lateral es siempre la viñeta más apaisada de la hoja.
  const perfil = metas.reduce((a, b) => (b.ar > a.ar ? b : a));

  // Corte por el hueco mayor de la serie ordenada. Las de interior son las de
  // menos fondo, y nunca son mayoría en una hoja: si el corte diera más de la
  // mitad es que no hay dos grupos, y entonces no se etiqueta ninguna.
  const orden = [...metas].sort((a, b) => a.fondo - b.fondo);
  let corte = 0;
  let salto = -1;
  for (let i = 1; i < orden.length; i++) {
    const d = orden[i].fondo - orden[i - 1].fondo;
    if (d > salto) { salto = d; corte = i; }
  }
  const interiores = new Set(
    corte <= metas.length / 2 ? orden.slice(0, corte).map((m) => m.f) : []
  );

  return metas.map((m) => ({
    url: `/coches-nuevos/${m.f}`,
    alt: `${nombreCoche} en renting — ${
      interiores.has(m.f) ? "interior" : m === perfil ? "perfil lateral" : "vista exterior"
    }`,
  }));
}

// argv[1] no existe cuando el módulo se importa desde `node -e`, que es como
// lo llama _fichas_drive.py.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , prefijo, ...nombre] = process.argv;
  console.log(JSON.stringify(await galeria(prefijo, nombre.join(" ")), null, 2));
}
