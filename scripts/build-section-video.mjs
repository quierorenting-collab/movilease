/**
 * Prepara un vídeo de fondo para una sección a partir de un clip de stock.
 *
 * Los MP4 que sirve Pexels son exportaciones crudas: el de 540p pesa 8,4 MB y
 * el de 1080p, 31 MB. Inservibles como fondo. Esto los deja en ~0,6-1,2 MB
 * recortando a unos segundos, quitando la pista de audio, escalando a 1280 px
 * y recomprimiendo, más un póster WebP de ~30 KB.
 *
 *   node scripts/build-section-video.mjs <url> [--nombre ofertas] [--inicio 4]
 *                                             [--duracion 10] [--ancho 1280]
 *
 * Salida en public/videos/: <nombre>.mp4, <nombre>.webm, <nombre>-poster.webp
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync, rmSync, existsSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const url = args.find((a) => a.startsWith("http"));

function opt(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

if (!url) {
  console.error(
    "Falta la URL del clip.\n" +
      "Uso: node scripts/build-section-video.mjs <url> [--nombre ofertas] " +
      "[--inicio 4] [--duracion 10] [--ancho 1280]"
  );
  process.exit(1);
}

const nombre = opt("nombre", "ofertas");
const inicio = opt("inicio", "0");
const duracion = opt("duracion", "10");
const ancho = opt("ancho", "1280");

const outDir = path.join(process.cwd(), "public", "videos");
mkdirSync(outDir, { recursive: true });

const tmp = path.join(outDir, `.${nombre}-fuente.mp4`);
const mp4 = path.join(outDir, `${nombre}.mp4`);
const webm = path.join(outDir, `${nombre}.webm`);
const poster = path.join(outDir, `${nombre}-poster.webp`);

const kb = (f) => (existsSync(f) ? (statSync(f).size / 1024).toFixed(0) + " KB" : "—");
const run = (bin, argv) => execFileSync(bin, argv, { stdio: ["ignore", "ignore", "inherit"] });

try {
  console.log(`Descargando el clip original…`);
  run("curl", ["-sL", "--max-time", "180", "-o", tmp, url]);
  console.log(`  original: ${kb(tmp)}`);

  // Recorte comun: sin audio, escalado a ancho par, sin ampliar
  const recorte = ["-ss", inicio, "-t", duracion, "-i", tmp, "-an"];
  const escala = `scale='min(${ancho},iw)':-2:flags=lanczos`;

  console.log("Codificando MP4 (H.264)…");
  run("ffmpeg", [
    "-y", ...recorte,
    "-vf", escala,
    "-c:v", "libx264", "-profile:v", "high", "-preset", "slow",
    "-crf", "30", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    mp4,
  ]);

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
  run("ffmpeg", ["-y", "-ss", inicio, "-i", tmp, "-vframes", "1", "-vf", escala, posterPng]);

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
