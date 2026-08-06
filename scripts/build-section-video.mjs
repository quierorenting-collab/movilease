/**
 * Prepara un vídeo de fondo para una sección a partir de un clip de stock.
 *
 * Los MP4 que sirve Pexels son exportaciones crudas: el de 540p pesa 8,4 MB y
 * el de 1080p, 31 MB. Inservibles como fondo. Esto los deja en ~0,6-1,2 MB
 * recortando a unos segundos, quitando la pista de audio, escalando a 1280 px
 * y recomprimiendo, más un póster WebP de ~30 KB.
 *
 *   node scripts/build-section-video.mjs <url-o-ruta> [--nombre ofertas]
 *        [--inicio 0] [--duracion 10] [--ancho 1440] [--eq "brightness=0.32:…"]
 *
 * `--eq` aplica el filtro eq de ffmpeg antes de escalar. Es lo que convierte un
 * clip de atardecer en un fondo claro: subir exposición y bajar saturación deja
 * la imagen aireada y el texto de encima legible con un velo mucho más suave.
 *
 * Salida en public/videos/: <nombre>.mp4, <nombre>.webm, <nombre>-poster.webp
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync, rmSync, existsSync, copyFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const fuente = args.find((a) => !a.startsWith("--") && (a.startsWith("http") || existsSync(a)));

function opt(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

if (!fuente) {
  console.error(
    "Falta el clip de origen (URL o ruta local existente).\n" +
      "Uso: node scripts/build-section-video.mjs <url-o-ruta> [--nombre ofertas] " +
      '[--inicio 0] [--duracion 10] [--ancho 1440] [--eq "brightness=0.32:saturation=0.28"]'
  );
  process.exit(1);
}

const nombre = opt("nombre", "ofertas");
const inicio = opt("inicio", "0");
const duracion = opt("duracion", "10");
const ancho = opt("ancho", "1440");
const eq = opt("eq", "");

const outDir = path.join(process.cwd(), "public", "videos");
mkdirSync(outDir, { recursive: true });

const tmp = path.join(outDir, `.${nombre}-fuente.mp4`);
const mp4 = path.join(outDir, `${nombre}.mp4`);
const webm = path.join(outDir, `${nombre}.webm`);
const poster = path.join(outDir, `${nombre}-poster.webp`);

const kb = (f) => (existsSync(f) ? (statSync(f).size / 1024).toFixed(0) + " KB" : "—");
const run = (bin, argv) => execFileSync(bin, argv, { stdio: ["ignore", "ignore", "inherit"] });

try {
  if (fuente.startsWith("http")) {
    console.log("Descargando el clip original…");
    run("curl", ["-sL", "--max-time", "180", "-o", tmp, fuente]);
  } else {
    console.log("Usando clip local…");
    copyFileSync(fuente, tmp);
  }
  console.log(`  original: ${kb(tmp)}`);

  // Recorte comun: sin audio, escalado a ancho par, sin ampliar
  const recorte = ["-ss", inicio, "-t", duracion, "-i", tmp, "-an"];
  const escala =
    (eq ? `eq=${eq},` : "") + `scale='min(${ancho},iw)':-2:flags=lanczos`;

  console.log("Codificando MP4 (H.264)…");
  run("ffmpeg", [
    "-y", ...recorte,
    "-vf", escala,
    "-c:v", "libx264", "-profile:v", "high", "-preset", "slow",
    "-crf", "30", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    mp4,
  ]);

  // VP9 no siempre gana: en material desenfocado y velado salio mas grande
  // que el H.264. Comprueba los tamanos antes de servir el WebM.
  console.log("Codificando WebM (VP9)…");
  run("ffmpeg", [
    "-y", ...recorte,
    "-vf", escala,
    "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0",
    "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
    webm,
  ]);

  console.log("Extrayendo póster…");
  const posterPng = path.join(outDir, `.${nombre}-poster.png`);
  run("ffmpeg", ["-y", "-ss", inicio, "-i", tmp, "-frames:v", "1", "-update", "1", "-vf", escala, posterPng]);

  const sharp = (await import("sharp")).default;
  await sharp(posterPng).webp({ quality: 68 }).toFile(poster);
  rmSync(posterPng, { force: true });

  console.log("\nResultado:");
  console.log(`  ${path.basename(mp4)}    ${kb(mp4)}`);
  console.log(`  ${path.basename(webm)}   ${kb(webm)}`);
  console.log(`  ${path.basename(poster)} ${kb(poster)}`);
  console.log("\nAcuérdate de poner OFERTAS_VIDEO = true en (public)/page.tsx");
} finally {
  rmSync(tmp, { force: true });
}
