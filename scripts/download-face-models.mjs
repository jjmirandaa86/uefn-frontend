/**
 * Descarga los pesos de face-api.js usados en el dashboard (tiny detector,
 * landmarks 68, expresiones, edad/género, reconocimiento) a public/models.
 *
 * Uso: node scripts/download-face-models.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "models");

const BASE =
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";

const FILES = [
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model-shard1",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model-shard1",
  "face_expression_model-weights_manifest.json",
  "face_expression_model-shard1",
  "age_gender_model-weights_manifest.json",
  "age_gender_model-shard1",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1",
  "face_recognition_model-shard2",
];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  for (const name of FILES) {
    const url = `${BASE}/${name}`;
    const dest = path.join(OUT, name);
    process.stdout.write(`→ ${name}\n`);
    await download(url, dest);
  }
  process.stdout.write(`\nListo: ${OUT}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
