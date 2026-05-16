import * as faceapi from "face-api.js";

const MODELS_URL =
  import.meta.env.VITE_FACE_API_MODELS_URL?.replace(/\/$/, "") || "/models";

let faceApiReady = false;
let loadPromise = null;
let landmarkLoadPromise = null;

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
    scoreThreshold: 0.45,
    inputSize: 320,
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

  return faceapi
    .detectAllFaces(videoEl, tinyOpts())
    .withFaceLandmarks();
}

let ageGenderLoadPromise = null;

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

/** Carga detector + landmarks + expresiones + edad/género (una pasada en el dashboard). */
export async function loadDashboardFaceModels() {
  const [a, b, c] = await Promise.all([
    loadFaceLandmarkModels(),
    loadFaceApiModels(),
    loadAgeGenderModel(),
  ]);
  const ok = a.ok && b.ok && c.ok;
  return {
    ok,
    error: !a.ok ? a.error : !b.ok ? b.error : c.error,
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
