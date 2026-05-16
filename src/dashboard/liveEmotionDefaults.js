import { emotions } from "../data/emotions.js";

export const NEUTRAL_FALLBACK = {
  ...(emotions.find((e) => e.key === "neutral") ?? emotions[0]),
  confidence: 0,
};

/** Filas para listas / barras: mismas claves que `emotions`, confianza en 0. */
export const EMOTION_ROWS_IDLE = emotions.map((e) => ({
  ...e,
  confidence: 0,
}));

/** Perfil aproximado (face-api edad/género) cuando no hay cara o la cámara está inactiva. */
export const APPROXIMATE_PROFILE_IDLE = {
  hasFace: false,
  ageYears: null,
  /** @type {'male' | 'female' | null} */
  gender: null,
};
