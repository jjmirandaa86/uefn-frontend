import * as faceapi from "face-api.js";

const MODELS_URL =
  import.meta.env.VITE_FACE_API_MODELS_URL?.replace(/\/$/, "") || "/models";

let faceApiReady = false;
let loadPromise = null;
let landmarkLoadPromise = null;
let dashboardModelsReady = false;

/** True si los pesos del dashboard ya están en memoria (no vuelven a descargarse en la sesión). */
export function areDashboardFaceModelsReady() {
  return dashboardModelsReady;
}

export function getFaceApi() {
  return faceapi;
}

/**
 * Carga tinyFaceDetector + faceExpressionNet (emociones).
 */
export async function loadFaceApiModels() {
  if (faceApiReady) return { ok: true };
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODELS_URL);
      faceApiReady = true;
      return { ok: true };
    } catch (e) {
      console.error("[faceApi] loadFaceApiModels:", e);
      loadPromise = null;
      return { ok: false, error: e };
    }
  })();

  return loadPromise;
}

/**
 * Carga tinyFaceDetector + faceLandmark68Net (puntos faciales).
 * No depende de faceExpressionNet.
 */
export async function loadFaceLandmarkModels() {
  if (landmarkLoadPromise) return landmarkLoadPromise;

  landmarkLoadPromise = (async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL);
      return { ok: true };
    } catch (e) {
      console.error("[faceApi] loadFaceLandmarkModels:", e);
      landmarkLoadPromise = null;
      return { ok: false, error: e };
    }
  })();

  return landmarkLoadPromise;
}

const tinyOpts = () =>
  new faceapi.TinyFaceDetectorOptions({
    scoreThreshold: 0.5,
    // 416 mejora el recorte facial → descriptores más estables (un poco más lento).
    inputSize: 416,
  });

/**
 * @param {HTMLVideoElement} videoEl
 * @returns {Promise<import('face-api.js').WithFaceLandmarks<import('face-api.js').WithFaceDetection<{}>>[] | null>}
 */
export async function detectFaceLandmarksFromVideo(videoEl) {
  if (!videoEl || videoEl.readyState < 2) return null;
  const w = videoEl.videoWidth;
  const h = videoEl.videoHeight;
  if (!w || !h) return null;

  const load = await loadFaceLandmarkModels();
  if (!load.ok) return null;

  return faceapi.detectAllFaces(videoEl, tinyOpts()).withFaceLandmarks();
}

let ageGenderLoadPromise = null;
let recognitionLoadPromise = null;

/** Carga faceRecognitionNet (descriptores para id estable por rostro). */
export async function loadFaceRecognitionModel() {
  if (recognitionLoadPromise) return recognitionLoadPromise;

  recognitionLoadPromise = (async () => {
    try {
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL);
      return { ok: true };
    } catch (e) {
      console.error("[faceApi] loadFaceRecognitionModel:", e);
      recognitionLoadPromise = null;
      return { ok: false, error: e };
    }
  })();

  return recognitionLoadPromise;
}

/** Carga ageGenderNet (edad y género aproximados). */
export async function loadAgeGenderModel() {
  if (ageGenderLoadPromise) return ageGenderLoadPromise;

  ageGenderLoadPromise = (async () => {
    try {
      await faceapi.nets.ageGenderNet.loadFromUri(MODELS_URL);
      return { ok: true };
    } catch (e) {
      console.error("[faceApi] loadAgeGenderModel:", e);
      ageGenderLoadPromise = null;
      return { ok: false, error: e };
    }
  })();

  return ageGenderLoadPromise;
}

/** Carga detector + landmarks + expresiones + edad/género + reconocimiento (dashboard). */
export async function loadDashboardFaceModels() {
  if (dashboardModelsReady) return { ok: true };
  const [a, b, c, d] = await Promise.all([
    loadFaceLandmarkModels(),
    loadFaceApiModels(),
    loadAgeGenderModel(),
    loadFaceRecognitionModel(),
  ]);
  const ok = a.ok && b.ok && c.ok && d.ok;
  if (ok) dashboardModelsReady = true;
  return {
    ok,
    error: !a.ok ? a.error : !b.ok ? b.error : !c.ok ? c.error : d.error,
  };
}

/**
 * Todas las caras con landmarks y expresiones (alineado a landmarks).
 * Requiere pesos en /models: tiny, landmark 68, face_expression, age_gender.
 */
export async function detectFacesLandmarksExpressionsFromVideo(videoEl) {
  if (!videoEl || videoEl.readyState < 2) return null;
  const w = videoEl.videoWidth;
  const h = videoEl.videoHeight;
  if (!w || !h) return null;

  const load = await loadDashboardFaceModels();
  if (!load.ok) return null;

  return faceapi
    .detectAllFaces(videoEl, tinyOpts())
    .withFaceLandmarks()
    .withFaceDescriptors()
    .withFaceExpressions()
    .withAgeAndGender();
}
/**
 * @param {HTMLVideoElement} videoEl
 */
export async function detectFaceExpressionsFromVideo(videoEl) {
  if (!videoEl || videoEl.readyState < 2) return null;
  const w = videoEl.videoWidth;
  const h = videoEl.videoHeight;
  if (!w || !h) return null;

  const load = await loadFaceApiModels();
  if (!load.ok) return null;

  const detection = await faceapi
    .detectSingleFace(videoEl, tinyOpts())
    .withFaceExpressions();

  if (!detection) return null;

  return detection.expressions;
}
