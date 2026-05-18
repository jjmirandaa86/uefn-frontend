/**
 * Repara un GIF dañado por chroma demasiado agresivo:
 * 1) Restaura alpha en píxeles que NO son blanco de fondo puro (cara, ropa coloreada).
 * 2) Cierra agujeros pequeños en la máscara (guantes/cara muy blanca) con morfología + color vecino.
 *
 * Requiere: ffmpeg en PATH, sharp (devDependency del proyecto).
 *
 * Uso: node scripts/repair-mario-gif-alpha.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const inputGif = path.join(root, "src/game/assets/mario-running.gif");
const outGif = path.join(root, "src/game/assets/mario-running.gif");

function isLikelyBackdrop(r, g, b) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  /** Casi blanco / gris muy claro típico de fondo claveado. */
  if (mn > 228 && mx - mn < 36) return true;
  if (r > 244 && g > 244 && b > 244 && mx - mn < 14) return true;
  return false;
}

function isTransparentPlaceholder(r, g, b, a) {
  if (a >= 32) return false;
  return r + g + b < 28;
}

function dilateDisk(mask, w, h, rad) {
  const out = new Uint8Array(w * h);
  const r2 = rad * rad;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let dy = -rad; dy <= rad && !v; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          if (mask[ny * w + nx]) {
            v = 1;
            break;
          }
        }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

function erodeDisk(mask, w, h, rad) {
  const out = new Uint8Array(w * h);
  const r2 = rad * rad;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 1;
      for (let dy = -rad; dy <= rad && v; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) {
            v = 0;
            break;
          }
          if (!mask[ny * w + nx]) {
            v = 0;
            break;
          }
        }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

function closingDisk(mask, w, h, rad) {
  return erodeDisk(dilateDisk(mask, w, h, rad), w, h, rad);
}

function neighborRgbWeighted(buf, alpha, w, h, x, y) {
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let wsum = 0;
  const R = 5;
  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const j = ny * w + nx;
      if (alpha[j] < 160) continue;
      const o = j * 4;
      const wt = 1 / (1 + dx * dx + dy * dy);
      sumR += buf[o] * wt;
      sumG += buf[o + 1] * wt;
      sumB += buf[o + 2] * wt;
      wsum += wt;
    }
  }
  if (wsum < 1e-6) return null;
  return {
    r: Math.round(sumR / wsum),
    g: Math.round(sumG / wsum),
    b: Math.round(sumB / wsum),
  };
}

function repairFrame(buf, w, h) {
  const rgba = new Uint8ClampedArray(buf);
  const n = w * h;

  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const a = rgba[o + 3];
    if (a >= 200) continue;
    const r = rgba[o];
    const g = rgba[o + 1];
    const b = rgba[o + 2];
    if (isTransparentPlaceholder(r, g, b, a)) continue;
    if (!isLikelyBackdrop(r, g, b)) {
      rgba[o + 3] = 255;
    }
  }

  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    mask[i] = rgba[i * 4 + 3] >= 128 ? 1 : 0;
  }
  const closed = closingDisk(mask, w, h, 3);

  const alphaArr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    alphaArr[i] = rgba[i * 4 + 3];
  }

  for (let i = 0; i < n; i++) {
    if (alphaArr[i] >= 200) continue;
    if (!closed[i]) continue;
    const x = i % w;
    const y = (i / w) | 0;
    const rgb = neighborRgbWeighted(rgba, alphaArr, w, h, x, y);
    if (!rgb) continue;
    const o = i * 4;
    rgba[o] = rgb.r;
    rgba[o + 1] = rgb.g;
    rgba[o + 2] = rgb.b;
    rgba[o + 3] = 255;
  }

  return Buffer.from(rgba);
}

async function main() {
  if (!fs.existsSync(inputGif)) {
    console.error("No existe:", inputGif);
    process.exit(1);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mario-gif-repair-"));
  const pattern = path.join(tmp, "f_%03d.png");

  try {
    execFileSync(
      "ffmpeg",
      ["-y", "-i", inputGif, pattern],
      { stdio: "inherit" },
    );

    const files = fs
      .readdirSync(tmp)
      .filter((f) => f.endsWith(".png"))
      .sort();

    if (files.length === 0) {
      console.error("ffmpeg no generó PNGs");
      process.exit(1);
    }

    for (const f of files) {
      const fp = path.join(tmp, f);
      const { data, info } = await sharp(fp)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      if (info.channels !== 4) {
        console.error("Se esperaba RGBA");
        process.exit(1);
      }
      const repaired = repairFrame(data, info.width, info.height);
      await sharp(repaired, {
        raw: { width: info.width, height: info.height, channels: 4 },
      })
        .png()
        .toFile(fp);
    }

    const vf =
      "split[s0][s1];[s0]palettegen=max_colors=256:reserve_transparent=1:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=2:new=1:alpha_threshold=128";

    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-framerate",
        "25",
        "-i",
        path.join(tmp, "f_%03d.png"),
        "-vf",
        vf,
        outGif,
      ],
      { stdio: "inherit" },
    );

    console.log("Listo:", outGif, "(" + files.length + " fotogramas)");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
