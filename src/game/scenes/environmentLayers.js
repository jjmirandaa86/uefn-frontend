import Phaser from "phaser";

/**
 * Fondo por capas (placeholders de color). De atrás hacia adelante:
 * 5 cielo → 4 montañas → 3 nubes → 2 árboles → 1 tierra.
 * Cuando tengas imágenes: `preload` + reemplazar gráficos por `this.add.tileSprite` / `Image`.
 */
export const ENV_LAYER_DEPTH = {
  sky: -60,
  mountains: -55,
  clouds: -50,
  trees: -45,
  earth: -40,
};

export const ENV_COLORS = {
  skyTop: 0x6ec4f5,
  skyMid: 0xa8daf8,
  skyHorizon: 0xffd9b8,
  mountainLight: 0x6a8a9a,
  mountainDark: 0x4a6570,
  mountainSnow: 0xe8f4fc,
  cloudCore: 0xffffff,
  cloudEdge: 0xdceefc,
  treeTrunk: 0x4e342e,
  treeCrown: 0x2e7d32,
  treeCrownDark: 0x1b5e20,
  grass: 0x558b2f,
  earthTop: 0x795548,
  earthBody: 0x5d4037,
  earthDeep: 0x3e2723,
};

/**
 * @param {Phaser.Scene} scene
 * @param {{ width: number; height: number; groundY: number; walkY?: number }} world
 */
export function addParallaxEnvironment(scene, world) {
  const W = world.width;
  const H = world.height;
  const gy = world.groundY;
  const wy = world.walkY ?? world.groundY;

  // --- 5. CIELO ---
  const sky = scene.add.graphics({ x: 0, y: 0 });
  const h0 = H * 0.38;
  const h1 = H * 0.28;
  const h2 = H * 0.34;
  sky.fillStyle(ENV_COLORS.skyTop, 1);
  sky.fillRect(0, 0, W, h0);
  sky.fillStyle(ENV_COLORS.skyMid, 1);
  sky.fillRect(0, h0, W, h1);
  sky.fillStyle(ENV_COLORS.skyHorizon, 1);
  sky.fillRect(0, h0 + h1, W, h2);
  sky.setScrollFactor(0.06, 0);
  sky.setDepth(ENV_LAYER_DEPTH.sky);

  // --- 4. MONTAÑAS ---
  const mountains = scene.add.graphics({ x: 0, y: 0 });
  mountains.fillStyle(ENV_COLORS.mountainDark, 1);
  let mx = -120;
  while (mx < W + 200) {
    const w = Phaser.Math.Between(220, 380);
    const peakH = Phaser.Math.Between(55, 120);
    const baseY = gy - 38 + Phaser.Math.Between(-6, 10);
    const peakX = mx + w * 0.45 + Phaser.Math.Between(-28, 28);
    mountains.fillTriangle(mx, baseY, peakX, baseY - peakH, mx + w, baseY);
    mx += w * 0.72;
  }
  mountains.fillStyle(ENV_COLORS.mountainLight, 0.5);
  mx = -80;
  while (mx < W + 160) {
    const w = Phaser.Math.Between(160, 280);
    const peakH = Phaser.Math.Between(32, 68);
    const baseY = gy - 32;
    const peakX = mx + w * 0.5;
    mountains.fillTriangle(mx, baseY, peakX, baseY - peakH, mx + w, baseY);
    mx += w * 0.55;
  }
  mountains.fillStyle(ENV_COLORS.mountainSnow, 0.4);
  for (let x = 80; x < W; x += 320) {
    mountains.fillEllipse(
      x + Phaser.Math.Between(-24, 36),
      gy - 92,
      Phaser.Math.Between(40, 58),
      12,
    );
  }
  mountains.setScrollFactor(0.18, 0);
  mountains.setDepth(ENV_LAYER_DEPTH.mountains);

  // --- 3. NUBES ---
  const clouds = scene.add.graphics({ x: 0, y: 0 });
  for (let i = 0; i < 26; i++) {
    const cx = Phaser.Math.Between(40, W - 40);
    const cy = Phaser.Math.Between(48, Math.min(200, gy - 170));
    const r = Phaser.Math.Between(20, 46);
    const a0 = Phaser.Math.FloatBetween(0.24, 0.52);
    const a1 = Phaser.Math.FloatBetween(0.12, 0.3);
    clouds.fillStyle(ENV_COLORS.cloudCore, a0);
    clouds.fillCircle(cx, cy, r);
    clouds.fillStyle(ENV_COLORS.cloudEdge, a1);
    clouds.fillCircle(cx - r * 0.35, cy + 4, r * 0.72);
    clouds.fillCircle(cx + r * 0.38, cy + 2, r * 0.62);
  }
  clouds.setScrollFactor(0.32, 0);
  clouds.setDepth(ENV_LAYER_DEPTH.clouds);

  // --- 2. ÁRBOLES ---
  const trees = scene.add.graphics({ x: 0, y: 0 });
  let tx = 70;
  while (tx < W - 40) {
    tx += Phaser.Math.Between(130, 250);
    const trunkW = Phaser.Math.Between(10, 16);
    const trunkH = Phaser.Math.Between(36, 60);
    const baseX = tx + Phaser.Math.Between(-18, 18);
    const baseY = wy - 14;
    trees.fillStyle(ENV_COLORS.treeTrunk, 1);
    trees.fillRect(baseX - trunkW / 2, baseY - trunkH, trunkW, trunkH);
    const crownR = Phaser.Math.Between(26, 42);
    trees.fillStyle(ENV_COLORS.treeCrownDark, 1);
    trees.fillCircle(baseX, baseY - trunkH - crownR * 0.32, crownR * 1.05);
    trees.fillStyle(ENV_COLORS.treeCrown, 0.95);
    trees.fillCircle(
      baseX - crownR * 0.22,
      baseY - trunkH - crownR * 0.42,
      crownR * 0.72,
    );
    trees.fillCircle(
      baseX + crownR * 0.28,
      baseY - trunkH - crownR * 0.38,
      crownR * 0.68,
    );
  }
  trees.setScrollFactor(0.52, 0);
  trees.setDepth(ENV_LAYER_DEPTH.trees);

  // --- 1. TIERRA (banda inferior, casi anclada al mundo) ---
  const earth = scene.add.graphics({ x: 0, y: 0 });
  earth.fillStyle(ENV_COLORS.earthDeep, 1);
  earth.fillRect(0, wy + 6, W, H - wy + 200);
  earth.fillStyle(ENV_COLORS.earthBody, 1);
  earth.fillRect(0, wy - 6, W, 52);
  earth.fillStyle(ENV_COLORS.earthTop, 1);
  earth.fillRect(0, wy - 18, W, 16);
  earth.fillStyle(ENV_COLORS.grass, 0.92);
  earth.fillRect(0, wy - 26, W, 12);
  for (let x = 0; x < W; x += 16) {
    earth.fillStyle(ENV_COLORS.grass, Phaser.Math.FloatBetween(0.35, 0.72));
    earth.fillRect(x + 2, wy - 28, 3, Phaser.Math.Between(5, 11));
  }
  earth.setScrollFactor(0.97, 0);
  earth.setDepth(ENV_LAYER_DEPTH.earth);

  scene.__envLayers = { sky, mountains, clouds, trees, earth };
}
