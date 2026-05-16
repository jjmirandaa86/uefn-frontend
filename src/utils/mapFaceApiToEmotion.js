import { emotions } from "../data/emotions.js";

const EMOTION_BY_KEY = Object.fromEntries(emotions.map((e) => [e.key, e]));

/** Etiquetas face-api.js → claves de `emotions.js` (fearful no existe en tu lista). */
const FACE_API_TO_USER = {
  neutral: "neutral",
  happy: "happy",
  sad: "sad",
  angry: "angry",
  surprised: "surprised",
  disgusted: "disgusted",
  fearful: "neutral",
};

/**
 * @param {import('face-api.js').FaceExpressions} expressions
 * @returns {{ key: string; label: string; emoji: string; color: string; confidence: number }}
 */
export function mapFaceApiToEmotion(expressions) {
  const scores = {};
  for (const e of emotions) {
    scores[e.key] = 0;
  }

  for (const [apiLabel, userKey] of Object.entries(FACE_API_TO_USER)) {
    const v = expressions[apiLabel];
    if (typeof v === "number") {
      scores[userKey] += v;
    }
  }

  const maxExpr = Math.max(...emotions.map((e) => scores[e.key]));
  if (maxExpr < 0.02) {
    return { ...EMOTION_BY_KEY.neutral, confidence: 0 };
  }

  let bestKey = "neutral";
  let bestScore = 0;
  for (const e of emotions) {
    const s = scores[e.key];
    if (s > bestScore) {
      bestScore = s;
      bestKey = e.key;
    }
  }

  const meta = EMOTION_BY_KEY[bestKey] ?? EMOTION_BY_KEY.neutral;
  return {
    ...meta,
    confidence: Math.min(99, Math.round(bestScore * 100)),
  };
}

/**
 * Probabilidades face-api (0–1) mapeadas a las claves de `emotions.js` (fearful → neutral).
 * @param {import('face-api.js').FaceExpressions} expressions
 * @returns {Array<{ key: string; label: string; emoji: string; color: string; confidence: number }>}
 */
export function mapFaceExpressionsToEmotionRows(expressions) {
  const scores = {};
  for (const e of emotions) {
    scores[e.key] = 0;
  }

  for (const [apiLabel, userKey] of Object.entries(FACE_API_TO_USER)) {
    const v = expressions[apiLabel];
    if (typeof v === "number") {
      scores[userKey] += v;
    }
  }

  const maxExpr = Math.max(...emotions.map((e) => scores[e.key]));
  if (maxExpr < 0.02) {
    return emotions.map((e) => ({ ...e, confidence: 0 }));
  }

  return emotions.map((e) => ({
    ...e,
    confidence: Math.min(100, Math.round((scores[e.key] ?? 0) * 100)),
  }));
}
