/**
 * Recorta la hoja de sprites 9x9 descrita en el diseño:
 * - Filas 0-4: 9 celdas pequeñas cada una (45 avatares)
 * - Filas 5-8, columnas 0-3: un solo avatar grande 4x4
 * - Filas 5-8, columnas 4-8: 5x4 celdas pequeñas (20 avatares)
 *
 * Uso:
 *   node scripts/split-avatar-sprite.mjs [rutaEntrada.png] [carpetaSalida]
 * Por defecto: scripts/avatar-sprite-source.png -> public/assets/avatars
 */

import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const COLS = 9;
const ROWS = 9;

function cellRect(imgW, imgH, r, c) {
  const left = Math.floor((c * imgW) / COLS);
  const top = Math.floor((r * imgH) / ROWS);
  const right = Math.floor(((c + 1) * imgW) / COLS);
  const bottom = Math.floor(((r + 1) * imgH) / ROWS);
  return { left, top, width: right - left, height: bottom - top };
}

function multiCellRect(imgW, imgH, r0, c0, r1, c1) {
  const a = cellRect(imgW, imgH, r0, c0);
  const b = cellRect(imgW, imgH, r1, c1);
  return {
    left: a.left,
    top: a.top,
    width: b.left + b.width - a.left,
    height: b.top + b.height - a.top,
  };
}

async function extract(inputPath, outDir) {
  const img = sharp(inputPath);
  const meta = await img.metadata();
  const w = meta.width;
  const h = meta.height;
  if (!w || !h) throw new Error("No se pudo leer el tamaño de la imagen");

  await mkdir(outDir, { recursive: true });

  let n = 0;
  const pad = (i) => String(i).padStart(3, "0");
  const save = async (rect) => {
    n += 1;
    const out = path.join(outDir, `avatar-${pad(n)}.png`);
    await sharp(inputPath).extract(rect).png().toFile(out);
    return out;
  };

  for (let r = 0; r <= 4; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      await save(cellRect(w, h, r, c));
    }
  }

  await save(multiCellRect(w, h, 5, 0, 8, 3));

  for (let r = 5; r <= 8; r += 1) {
    for (let c = 4; c <= 8; c += 1) {
      await save(cellRect(w, h, r, c));
    }
  }

  return { count: n, width: w, height: h };
}

const defaultInput = path.join(ROOT, "scripts", "avatar-sprite-source.png");
const defaultOut = path.join(ROOT, "public", "assets", "avatars");

const inputPath = path.resolve(process.argv[2] || defaultInput);
const outDir = path.resolve(process.argv[3] || defaultOut);

const result = await extract(inputPath, outDir);
console.log(`OK: ${result.count} PNG en ${outDir} (origen ${result.width}x${result.height})`);
