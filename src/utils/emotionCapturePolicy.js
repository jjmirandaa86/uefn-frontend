import { emotions } from "../data/emotions.js";
import {
  getAppSettingFloat,
  getAppSettingInt,
} from "./appSettingsStore.js";
import { computeEmotionScores, mapFaceApiToEmotion } from "./mapFaceApiToEmotion.js";

/** Umbrales para decidir cuándo disparar la captura (.env o modal Configuración). */
export function getEmotionCapturePolicy() {
  return {
    delayMs: getAppSettingInt("VITE_EMOTION_CAPTURE_DELAY_MS", 2500, {
      min: 0,
      max: 60_000,
    }),
    minConfidence: getAppSettingInt("VITE_EMOTION_CAPTURE_MIN_CONFIDENCE", 48, {
      min: 10,
      max: 95,
    }),
    neutralMinConfidence: getAppSettingInt(
      "VITE_EMOTION_CAPTURE_NEUTRAL_MIN_CONFIDENCE",
      58,
      { min: 10, max: 95 },
    ),
    minDominanceGap: getAppSettingInt("VITE_EMOTION_CAPTURE_MIN_DOMINANCE", 8, {
      min: 0,
      max: 80,
    }),
    minRawScore: getAppSettingFloat("VITE_EMOTION_CAPTURE_MIN_SCORE", 0.35, {
      min: 0.05,
      max: 0.95,
    }),
    confidenceHysteresis: getAppSettingInt(
      "VITE_EMOTION_CAPTURE_CONFIDENCE_HYSTERESIS",
      8,
      { min: 0, max: 30 },
    ),
  };
}

/**
 * ¿La emoción actual es lo bastante clara para iniciar/continuar cuenta de captura?
 * @param {import('face-api.js').FaceExpressions} expressions
 */
export function evaluateEmotionCaptureReadiness(expressions) {
  const policy = getEmotionCapturePolicy();
  const scores = computeEmotionScores(expressions);
  const emotion = mapFaceApiToEmotion(expressions);

  const ranked = emotions
    .map((e) => ({ key: e.key, score: scores[e.key] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const second = ranked[1] ?? { key: "neutral", score: 0 };
  const confidence = emotion.confidence;
  const dominanceGap = Math.round((best.score - second.score) * 100);

  const minConfidence =
    emotion.key === "neutral"
      ? policy.neutralMinConfidence
      : policy.minConfidence;

  const reasons = [];
  if (best.score < policy.minRawScore) {
    reasons.push("score-bajo");
  }
  if (confidence < minConfidence) {
    reasons.push("confianza-baja");
  }
  if (dominanceGap < policy.minDominanceGap) {
    reasons.push("emocion-ambigua");
  }

  return {
    ready: reasons.length === 0,
    emotion,
    confidence,
    dominanceGap,
    minConfidence,
    reasons,
    policy,
  };
}

/**
 * Durante el retardo: si la confianza cae demasiado, reiniciar temporizador.
 * @param {number} confidence
 * @param {number} minConfidence
 * @param {number} hysteresis
 */
export function isConfidenceStillStable(confidence, minConfidence, hysteresis) {
  return confidence >= minConfidence - hysteresis;
}
