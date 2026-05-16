/** URL de pesos face-api (misma carpeta que el resto del proyecto). */
export const FACE_MODELS_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_FACE_API_MODELS_URL?.replace(/\/$/, "")) ||
  "/models";

/** Dimensiones lógicas del nivel (mundo). */
export const WORLD = {
  width: 4800,
  height: 720,
  groundY: 620,
};

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
