import * as faceapi from "face-api.js";
import { FACE_MODELS_URL } from "../config.js";

let ready = false;
let promise = null;

/** Carga tinyFaceDetector + landmarks 68 + expresiones (sonrisa). */
export async function loadGameFaceModels() {
  if (ready) return { ok: true };
  if (promise) return promise;

  promise = (async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODELS_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODELS_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(FACE_MODELS_URL);
      ready = true;
      return { ok: true };
    } catch (e) {
      console.error("[game/face] loadGameFaceModels:", e);
      promise = null;
      return { ok: false, error: e };
    }
  })();

  return promise;
}

export function tinyFaceOptions() {
  return new faceapi.TinyFaceDetectorOptions({
    scoreThreshold: 0.42,
    inputSize: 320,
  });
}

export { faceapi };
