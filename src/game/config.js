/** URL de pesos face-api (misma carpeta que el resto del proyecto). */
export const FACE_MODELS_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_FACE_API_MODELS_URL?.replace(/\/$/, "")) ||
  "/models";

/** Dimensiones lógicas del nivel (mundo). */
export const WORLD = {
  width: 4800,
  /**
   * Alto lógico del mundo (Phaser). Debe ser mayor que `walkY + 12` (borde inferior del tile de suelo)
   * para que el suelo y la cámara tengan margen.
   */
  height: 500,
  /** Horizonte del fondo (montañas, cielo). */
  groundY: 500,
  /**.
   * Superficie por la que camina el jugador (Y menor = más arriba).
   * El suelo `tex_ground` se centra en `walkY - 12`.
   */
  walkY: 524,
  /**
   * Plataformas flotantes: aire entre la **cima** del suelo caminable y la **base** de la fila más baja.
   */
  floatPlatformBaseGap: 46,
  /** Separación vertical entre “pisos” (cada +1 sube una plataforma ~un salto controlado). */
  floatPlatformRise: 78,
  /** Alto del collider de cada plataforma rectangular. */
  floatPlatformH: 18,
};

/**
 * Tamaños visuales y de colisión (jugador, enemigos, monedas, meta, jefe, disparo).
 * Ajusta aquí para escalar el nivel de un solo sitio.
 */
export const SPRITES = {
  playerW: 54,
  playerH: 78,
  playerBodyW: 42,
  playerBodyH: 70,
  playerBodyOffX: 6,
  playerBodyOffY: 4,

  enemyDisplay: 54,
  enemyBodyW: 42,
  enemyBodyH: 42,
  enemyBodyOffX: 6,
  enemyBodyOffY: 9,

  coinDisplay: 34,
  coinHitRadius: 17,

  flagW: 42,
  flagH: 64,

  bossDisplayW: 108,
  bossDisplayH: 108,
  bossBodyW: 84,
  bossBodyH: 84,

  fireDisplay: 18,
  shootSpawnX: 40,
  shootSpawnY: 6,

  /** Moneda flotando sobre plataforma: separación vertical respecto al centro de la plataforma. */
  coinAbovePlatform: 33,
  /** Monedas en el suelo: bajo el centro del jugador. */
  coinGroundYOffset: 15,
  coinTweenFloat: 10,
  stompEnemyMargin: 22,
  burstParticleScaleStart: 0.48,
  dustParticleScaleStart: 0.17,
  /**
   * Corrección Y (px, hacia abajo en pantalla) para enemigos patrulla si el arte “flota” sobre el suelo.
   */
  enemyFloorNudgeY: 8,
};

/**
 * Tiles de suelo `tex_ground`: altura 24px, centrados en `WORLD.walkY - 12` (ver MainGameScene `_buildWorld`).
 */
export function floorSurfaceTopY() {
  return WORLD.walkY - 24;
}

/**
 * Centro Y de una plataforma rectangular de alto `h`, alineada al suelo caminable.
 * `tier` 0 = la más baja (aún por encima del suelo), cada +1 sube `floatPlatformRise` px.
 */
export function floatingPlatformCenterY(tier, h = WORLD.floatPlatformH) {
  const t = Math.max(0, tier);
  const platformTop =
    floorSurfaceTopY() -
    WORLD.floatPlatformBaseGap -
    t * WORLD.floatPlatformRise;
  return platformTop + h / 2;
}

/** Y de moneda un poco por encima del centro de una plataforma del tier indicado. */
export function coinAbovePlatformTier(
  tier,
  above = SPRITES.coinAbovePlatform,
  h = WORLD.floatPlatformH,
) {
  return floatingPlatformCenterY(tier, h) - above;
}

/**
 * Centro Y (origen 0.5) para que la **base** de un sprite de alto `displayHeightPx`
 * coincida con la cima del suelo caminable (`floorSurfaceTopY()`).
 */
export function feetOnFloorCenterY(displayHeightPx) {
  return floorSurfaceTopY() - displayHeightPx / 2;
}

/** Centro Y del jugador cuando está apoyado en el suelo (alto `SPRITES.playerH`). */
export function playerOnFloorCenterY() {
  return feetOnFloorCenterY(SPRITES.playerH);
}

/** Centro Y del enemigo patrullero apoyado en el mismo suelo (alto `SPRITES.enemyDisplay`). */
export function enemyOnFloorCenterY() {
  return feetOnFloorCenterY(SPRITES.enemyDisplay) + SPRITES.enemyFloorNudgeY;
}

/** Centro Y del jefe final con los pies en el suelo (alto visual `SPRITES.bossDisplayH`). */
export function bossOnFloorCenterY() {
  return feetOnFloorCenterY(SPRITES.bossDisplayH);
}

/** Sensibilidad por defecto (editable en calibración). */
export const DEFAULT_SENSITIVITY = {
  /** Umbral de giro de cabeza (-1..1) para moverse. */
  yawDeadzone: 0.06,
  yawGain: 2.2,
  /** Apertura de boca normalizada: por debajo = sin salto. */
  mouthJumpThreshold: 0.12,
  mouthJumpGain: 1.15,
  /** happy / smiling para sprint. */
  smileSprintThreshold: 0.38,
  /** Entrecerrar ojos: umbral sobre `eyeShoot` (0..1). */
  eyeShootThreshold: 0.58,
};

export const COOLDOWNS_MS = {
  jump: 420,
  shoot: 550,
};
