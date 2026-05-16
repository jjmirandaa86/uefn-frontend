import { useEffect, useRef } from "react";
import {
  faceapi,
  loadGameFaceModels,
  tinyFaceOptions,
} from "../faceDetection/loadGameFaceModels.js";
import { landmarksToControls } from "../faceDetection/landmarksToControls.js";

function drawLandmarks(canvas, video, landmarks) {
  if (!canvas || !video || !landmarks?.positions) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return;
  const cw = canvas.width;
  const ch = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  const sx = cw / vw;
  const sy = ch / vh;
  ctx.save();
  ctx.translate(cw, 0);
  ctx.scale(-1, 1);
  ctx.strokeStyle = "rgba(196, 181, 253, 0.85)";
  ctx.lineWidth = 1.5;
  ctx.fillStyle = "rgba(248, 250, 252, 0.9)";
  for (const p of landmarks.positions) {
    const x = p.x * sx;
    const y = p.y * sy;
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function clearLandmarks(canvas) {
  const ctx = canvas?.getContext?.("2d");
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Bucle requestAnimationFrame: face-api → controles + dibujo de landmarks.
 * `onControls` recibe { moveX, mouthOpen, sprint, smile, eyeShoot, label, rawEyeOpen }.
 */
export function useFaceGameControls({
  active,
  videoRef,
  canvasRef,
  calibRef,
  sensitivityRef,
  onControls,
}) {
  const onControlsRef = useRef(onControls);
  onControlsRef.current = onControls;

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    let cancelled = false;
    let rafId = 0;

    const tick = async () => {
      if (cancelled) return;
      rafId = requestAnimationFrame(tick);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || video.readyState < 2) {
        onControlsRef.current?.({
          moveX: 0,
          mouthOpen: 0,
          sprint: false,
          smile: 0,
          eyeShoot: 0,
          label: "Cámara…",
          rawYaw: 0,
          rawMouthOpen: 0,
          rawEyeOpen: 0,
        });
        return;
      }

      const loaded = await loadGameFaceModels();
      if (!loaded.ok || cancelled) {
        onControlsRef.current?.({
          moveX: 0,
          mouthOpen: 0,
          sprint: false,
          smile: 0,
          eyeShoot: 0,
          label: "Modelos…",
          rawYaw: 0,
          rawMouthOpen: 0,
          rawEyeOpen: 0,
        });
        return;
      }

      try {
        const det = await faceapi
          .detectSingleFace(video, tinyFaceOptions())
          .withFaceLandmarks()
          .withFaceExpressions();
        if (cancelled) return;

        if (!det) {
          clearLandmarks(canvas);
          onControlsRef.current?.({
            moveX: 0,
            mouthOpen: 0,
            sprint: false,
            smile: 0,
            eyeShoot: 0,
            label: "Sin cara",
            rawYaw: 0,
            rawMouthOpen: 0,
            rawEyeOpen: 0,
          });
          return;
        }

        const sens = sensitivityRef?.current ?? {};
        const c = landmarksToControls(det, det.expressions, calibRef?.current);
        drawLandmarks(canvas, video, det.landmarks);

        const thr = sens.smileSprintThreshold ?? 0.38;
        onControlsRef.current?.({
          moveX: Math.max(-1, Math.min(1, c.yaw)),
          mouthOpen: c.mouthOpen,
          sprint: c.smile >= thr,
          smile: c.smile,
          eyeShoot: c.eyeShoot,
          label: c.label,
          rawYaw: c.rawYaw,
          rawMouthOpen: c.rawMouthOpen,
          rawEyeOpen: c.rawEyeOpen,
        });
      } catch {
        onControlsRef.current?.({
          moveX: 0,
          mouthOpen: 0,
          sprint: false,
          smile: 0,
          eyeShoot: 0,
          label: "Error",
          rawYaw: 0,
          rawMouthOpen: 0,
          rawEyeOpen: 0,
        });
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearLandmarks(canvas);
    };
  }, [active, videoRef, canvasRef, calibRef, sensitivityRef]);
}
