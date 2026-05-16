import * as faceapi from "face-api.js";

const MODELS_PATH =
  import.meta.env.VITE_FACE_API_MODELS_URL?.replace(/\/$/, "") ?? "/models";

let loadPromise = null;

export function getFaceApi() {
  return faceapi;
}

function dominantExpression(expressions) {
  return Object.entries(expressions).sort((a, b) => b[1] - a[1])[0];
}

// Carga TinyFaceDetector + FaceExpressionNet. Pesos en public/models o VITE_FACE_API_MODELS_URL.
// https://github.com/justadudewhohacks/face-api.js/tree/master/weights
export async function loadFaceApiModels() {
  if (typeof window === "undefined") {
    return { ok: false, error: "face-api.js solo se ejecuta en el navegador" };
  }
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_PATH);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODELS_PATH);
      return { ok: true };
    } catch (err) {
      loadPromise = null;
      const message =
        err?.message ??
        "No se pudieron cargar los modelos. Coloca los .shard en public/models o define VITE_FACE_API_MODELS_URL.";
      return { ok: false, error: message };
    }
  })();

  return loadPromise;
}

export async function detectFaceExpressionsFromVideo(videoEl, options = {}) {
  const loaded = await loadFaceApiModels();
  if (!loaded.ok) {
    return { ok: false, error: loaded.error, faces: [] };
  }

  const inputSize = options.inputSize ?? 416;
  const scoreThreshold = options.scoreThreshold ?? 0.5;

  const detections = await faceapi
    .detectAllFaces(
      videoEl,
      new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold }),
    )
    .withFaceExpressions();

  const faces = detections.map((d) => {
    const [label, confidence] = dominantExpression(d.expressions);
    return {
      box: d.detection.box,
      expressions: { ...d.expressions },
      dominant: { label, confidence },
    };
  });

  return { ok: true, faces };
}
