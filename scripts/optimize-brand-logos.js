/**
 * Los logos de marca pesaban 7,6 MB en total (hasta 1,6 MB uno solo) para
 * mostrarse a 64 px de alto. Se reescalan a 240 px de ancho (cubre 64 px a 3x)
 * y se recomprimen. Los SVG con rásters incrustados se rasterizan a PNG.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(process.cwd(), "public", "brands");
const MAX_WIDTH = 240;
const SVG_RASTER_THRESHOLD = 40 * 1024; // un SVG vectorial real no pesa esto

async function main() {
  const files = fs.readdirSync(DIR);
  const report = [];
  const renamed = {};

  for (const file of files) {
    const full = path.join(DIR, file);
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);
    const before = fs.statSync(full).size;

    try {
      if (ext === ".svg") {
        if (before < SVG_RASTER_THRESHOLD) {
          report.push({ file, before, after: before, accion: "svg vectorial, intacto" });
          continue;
        }
        // SVG enorme => lleva un ráster dentro; se rasteriza a PNG
        const out = path.join(DIR, base + ".png");
        const buf = await sharp(full, { density: 200 })
          .resize({ width: MAX_WIDTH, withoutEnlargement: true })
          .png({ compressionLevel: 9, palette: true })
          .toBuffer();
        fs.writeFileSync(out, buf);
        fs.unlinkSync(full);
        renamed[base] = "png";
        report.push({ file, before, after: buf.length, accion: "svg -> png" });
        continue;
      }

      if (![".png", ".jpg", ".jpeg"].includes(ext)) {
        report.push({ file, before, after: before, accion: "ignorado" });
        continue;
      }

      const meta = await sharp(full).metadata();
      const pipeline = sharp(full).resize({ width: MAX_WIDTH, withoutEnlargement: true });
      // conservar transparencia: todo a PNG
      const buf = await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();

      const out = path.join(DIR, base + ".png");
      if (buf.length < before || ext !== ".png") {
        fs.writeFileSync(out, buf);
        if (ext !== ".png") {
          fs.unlinkSync(full);
          renamed[base] = "png";
        }
        report.push({ file, before, after: buf.length, accion: `${meta.width}px -> ${Math.min(MAX_WIDTH, meta.width)}px` });
      } else {
        report.push({ file, before, after: before, accion: "ya óptimo" });
      }
    } catch (err) {
      report.push({ file, before, after: before, accion: "ERROR: " + err.message });
    }
  }

  const kb = (n) => (n / 1024).toFixed(0) + "K";
  const totalBefore = report.reduce((s, r) => s + r.before, 0);
  const totalAfter = report.reduce((s, r) => s + r.after, 0);

  report
    .sort((a, b) => b.before - a.before)
    .slice(0, 12)
    .forEach((r) => console.log(`${r.file.padEnd(20)} ${kb(r.before).padStart(7)} -> ${kb(r.after).padStart(7)}  ${r.accion}`));

  console.log("\nTOTAL: " + kb(totalBefore) + " -> " + kb(totalAfter));
  console.log("RENOMBRADOS: " + JSON.stringify(renamed));
}

main();
