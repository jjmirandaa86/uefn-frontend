#!/usr/bin/env node
/**
 * Ejecuta `vite build`, mide `dist/` y actualiza `docs/bundle-baseline.json`.
 * Opcional: si existe `docs/bundle-stats.json` (tras `npm run build:analyze`),
 * agrega el desglose por paquete.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const baselinePath = path.join(root, "docs", "bundle-baseline.json");
const statsJsonPath = path.join(root, "docs", "bundle-stats.json");

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function gzipSize(buffer) {
  return gzipSync(buffer).length;
}

function readDirRecursive(dir, base = dir) {
  const entries = [];
  if (!fs.existsSync(dir)) return entries;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      entries.push(...readDirRecursive(full, base));
    } else {
      const rel = path.relative(base, full).replace(/\\/g, "/");
      const buf = fs.readFileSync(full);
      entries.push({
        path: rel,
        bytes: stat.size,
        gzipBytes: gzipSize(buf),
      });
    }
  }
  return entries;
}

function pkgFromAncestorPath(ancestors) {
  const nmIdx = ancestors.findIndex((seg) => seg.includes("node_modules"));
  if (nmIdx < 0) return "(app + vendors inlined)";
  const after = ancestors.slice(nmIdx + 1).filter(Boolean);
  if (after.length === 0) return "(node_modules)";
  if (after[0].startsWith("@") && after[1]) {
    return `${after[0]}/${after[1].split("/")[0]}`;
  }
  return after[0].split("/")[0].replace(/\?.*$/, "");
}

/** Agrupa módulos del visualizer por paquete npm según el árbol de Rollup. */
function topPackagesFromStats(stats, limit = 15) {
  if (!stats?.tree) return [];

  const byPkg = new Map();

  function walk(node, ancestors = []) {
    const name = node.name ?? "";
    const nextAncestors = name ? [...ancestors, name] : ancestors;

    if (node.uid && stats.nodeParts?.[node.uid]) {
      const meta = stats.nodeParts[node.uid];
      const pkg = pkgFromAncestorPath(nextAncestors);
      const prev = byPkg.get(pkg) ?? { gzip: 0, raw: 0 };
      byPkg.set(pkg, {
        gzip: prev.gzip + (meta.gzipLength ?? 0),
        raw: prev.raw + (meta.renderedLength ?? 0),
      });
    }

    if (node.children) {
      for (const child of node.children) walk(child, nextAncestors);
    }
  }

  walk(stats.tree);

  return [...byPkg.entries()]
    .map(([pkg, sizes]) => ({ pkg, ...sizes }))
    .sort((a, b) => b.gzip - a.gzip)
    .slice(0, limit);
}

function parseViteBuildLog(output) {
  const chunks = [];
  const chunkRe =
    /dist\/(\S+?)\s+([\d.]+)\s+kB\s+│\s+gzip:\s+([\d.]+)\s+kB/g;
  let m;
  while ((m = chunkRe.exec(output)) !== null) {
    chunks.push({
      file: m[1],
      kB: Number(m[2]),
      gzipKB: Number(m[3]),
    });
  }
  const modulesMatch = output.match(/(\d+)\s+modules transformed/);
  return {
    modulesTransformed: modulesMatch ? Number(modulesMatch[1]) : null,
    chunks,
  };
}

const skipBuild = process.argv.includes("--skip-build");
let buildMeta = { modulesTransformed: null, chunks: [] };

if (skipBuild) {
  console.log("[bundle:baseline] Skipping build (--skip-build). Measuring dist/ only.");
} else {
  console.log("[bundle:baseline] Running vite build…");
  const buildLog = execSync("npm run build", {
    cwd: root,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  buildMeta = parseViteBuildLog(buildLog);
}

const allFiles = readDirRecursive(distDir);
const jsFiles = allFiles.filter((f) => f.path.endsWith(".js"));
const cssFiles = allFiles.filter((f) => f.path.endsWith(".css"));
const imageFiles = allFiles.filter((f) =>
  /\.(png|gif|webp|jpe?g|svg)$/i.test(f.path),
);
const gameMediaFiles = imageFiles.filter(
  (f) =>
    /mario|bowser|flag|Game-Over|design-snes|Super-Mario/i.test(f.path) &&
    !f.path.includes("avatars"),
);
const avatarMediaFiles = imageFiles.filter((f) => f.path.includes("avatars"));
const modelsDir = path.join(distDir, "models");
let modelsBytes = 0;
if (fs.existsSync(modelsDir)) {
  modelsBytes = readDirRecursive(modelsDir).reduce((s, f) => s + f.bytes, 0);
}
const publicModelsDir = path.join(root, "public", "models");
let publicModelsBytes = 0;
if (fs.existsSync(publicModelsDir)) {
  publicModelsBytes = readDirRecursive(publicModelsDir).reduce(
    (s, f) => s + f.bytes,
    0,
  );
}

let topPackages = [];
if (fs.existsSync(statsJsonPath)) {
  try {
    const stats = JSON.parse(fs.readFileSync(statsJsonPath, "utf8"));
    topPackages = topPackagesFromStats(stats);
    console.log(
      `[bundle:baseline] Loaded package breakdown from ${path.relative(root, statsJsonPath)}`,
    );
  } catch (e) {
    console.warn("[bundle:baseline] Could not parse bundle-stats.json:", e.message);
  }
} else {
  console.log(
    "[bundle:baseline] Tip: run `npm run build:analyze` first for topPackages breakdown.",
  );
}

const totalDistBytes = allFiles.reduce((s, f) => s + f.bytes, 0);
const appJsFiles = jsFiles.filter((f) => f.path.startsWith("assets/"));
const mainJs = appJsFiles.reduce(
  (best, f) => (f.bytes > (best?.bytes ?? 0) ? f : best),
  null,
);

const snapshot = {
  capturedAt: new Date().toISOString(),
  viteVersion: JSON.parse(
    fs.readFileSync(path.join(root, "node_modules/vite/package.json"), "utf8"),
  ).version,
  build: {
    modulesTransformed: buildMeta.modulesTransformed,
    jsChunkCount: jsFiles.length,
    cssChunkCount: cssFiles.length,
    viteReportedChunks: buildMeta.chunks,
  },
  initialLoad: {
    mainJs: mainJs
      ? {
          file: mainJs.path,
          bytes: mainJs.bytes,
          gzipBytes: mainJs.gzipBytes,
        }
      : null,
    allJs: {
      bytes: jsFiles.reduce((s, f) => s + f.bytes, 0),
      gzipBytes: jsFiles.reduce((s, f) => s + f.gzipBytes, 0),
      files: jsFiles.map((f) => ({
        file: f.path,
        bytes: f.bytes,
        gzipBytes: f.gzipBytes,
      })),
    },
    css: {
      bytes: cssFiles.reduce((s, f) => s + f.bytes, 0),
      gzipBytes: cssFiles.reduce((s, f) => s + f.gzipBytes, 0),
      files: cssFiles.map((f) => ({
        file: f.path,
        bytes: f.bytes,
        gzipBytes: f.gzipBytes,
      })),
    },
  },
  goals: {
    initialJsGzipMaxKB: 500,
    minJsChunkCount: 4,
    faceApiNotInInitialChunk: true,
    gameChunkIsolated: true,
  },
  deferred: {
    gameMedia: {
      bytes: gameMediaFiles.reduce((s, f) => s + f.bytes, 0),
      files: gameMediaFiles
        .sort((a, b) => b.bytes - a.bytes)
        .map((f) => ({ file: f.path, bytes: f.bytes })),
    },
    avatarMedia: {
      bytes: avatarMediaFiles.reduce((s, f) => s + f.bytes, 0),
      fileCount: avatarMediaFiles.length,
    },
    faceApiModels: {
      distModelsBytes: modelsBytes,
      publicModelsBytes,
    },
  },
  dist: {
    totalBytes: totalDistBytes,
    fileCount: allFiles.length,
  },
  topPackages,
  notes: [
    "Single JS chunk: no route-level code splitting yet.",
    "recentHistoryCache.js is dynamically imported but also statically imported (Vite warning).",
    "recharts is in package.json but not present in the production bundle.",
  ],
};

fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
fs.writeFileSync(baselinePath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log("\n[bundle:baseline] Snapshot written to docs/bundle-baseline.json\n");
console.log(`  Main JS:     ${formatBytes(mainJs?.bytes ?? 0)} (${formatBytes(mainJs?.gzipBytes ?? 0)} gzip)`);
console.log(`  CSS:         ${formatBytes(snapshot.initialLoad.css.bytes)} (${formatBytes(snapshot.initialLoad.css.gzipBytes)} gzip)`);
console.log(`  JS chunks:   ${jsFiles.length}`);
console.log(`  dist/ total: ${formatBytes(totalDistBytes)}`);
console.log(`  Game media:  ${formatBytes(snapshot.deferred.gameMedia.bytes)}`);
console.log(
  `  Avatars:     ${formatBytes(snapshot.deferred.avatarMedia.bytes)} (${snapshot.deferred.avatarMedia.fileCount} files)`,
);
console.log(`  Models:      ${formatBytes(publicModelsBytes)} (public/models, runtime)`);
if (topPackages.length) {
  console.log("\n  Top packages (gzip):");
  for (const p of topPackages.slice(0, 8)) {
    console.log(`    - ${p.pkg}: ${formatBytes(p.gzip)}`);
  }
}
