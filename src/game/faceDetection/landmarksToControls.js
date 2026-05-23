import { clamp } from "../utils/clamp.js";

/**
 * A partir de landmarks 68 + expresiones, produce controles normalizados.
 * `yaw`: mirar a la derecha del jugador → positivo (ajustado a sensación selfie).
 * `mouthOpen` / `smile`: salto y sprint.
 * `eyeShoot`: entrecerrar ojos (apertura vertical menor que el neutro calibrado).
 */
export function landmarksToControls(detection, expressions, calib) {
  const out = {
    rawYaw: 0,
    rawMouthOpen: 0,
    rawEyeOpen: 0,
    yaw: 0,
    mouthOpen: 0,
    smile: 0,
    eyeShoot: 0,
    label: "Sin cara",
  };

  if (!detection?.landmarks || !expressions) {
    return out;
  }

  const pos = detection.landmarks.positions;
  if (!pos?.length) return out;

  const nose = pos[30];
  const jawL = pos[2];
  const jawR = pos[14];
  const faceW = Math.max(24, Math.abs(jawR.x - jawL.x));
  const centerX = (jawL.x + jawR.x) / 2;
  const yawRaw = (nose.x - centerX) / (faceW * 0.35);
  const yawNeutral = calib?.neutralYawRaw ?? 0;
  /** Invierte el giro respecto al video crudo para que coincida con “mirar a un lado” en selfie. */
  const yaw = -clamp(yawRaw - yawNeutral, -1, 1) * (calib?.yawGain ?? 1) * 1.15;

  const topLip = pos[62];
  const bottomLip = pos[66];
  const mouthH = Math.abs(bottomLip.y - topLip.y);
  const jawH = Math.abs(pos[8].y - pos[27].y) || 1;
  const mouthOpenRaw = mouthH / jawH;
  const mouthNeutral = calib?.mouthNeutral ?? 0.08;
  const mouthOpen = clamp(
    (mouthOpenRaw - mouthNeutral) * (calib?.mouthGain ?? 6),
    0,
    1,
  );

  const smile = clamp(expressions.happy ?? 0, 0, 1);

  /** Apertura vertical ojo / altura de cara (68 pts: párpados 37–41 y 43–47). */
  const upperL = (pos[37].y + pos[38].y) / 2;
  const lowerL = (pos[40].y + pos[41].y) / 2;
  const upperR = (pos[43].y + pos[44].y) / 2;
  const lowerR = (pos[46].y + pos[47].y) / 2;
  const openL = Math.abs(upperL - lowerL) / jawH;
  const openR = Math.abs(upperR - lowerR) / jawH;
  const rawEyeOpen = (openL + openR) / 2;

  const eyeNeutral =
    typeof calib?.eyeOpenNeutral === "number" && calib.eyeOpenNeutral > 0.018
      ? calib.eyeOpenNeutral
      : 0.048;
  const drop = Math.max(0, eyeNeutral - rawEyeOpen);
  const denom = Math.max(0.012, eyeNeutral * 0.32);
  const eyeShoot = clamp(drop / denom, 0, 1);

  let label = "Neutral";
  if (yaw < -0.2) label = "Mira ←";
  else if (yaw > 0.2) label = "Mira →";
  if (mouthOpen > 0.2) label = "Boca (salto)";
  if (smile > 0.35) label = "Sonrisa (sprint)";
  if (eyeShoot > 0.52) label = "Ojos (disparo)";

  return {
    rawYaw: yawRaw,
    rawMouthOpen: mouthOpenRaw,
    rawEyeOpen,
    yaw,
    mouthOpen,
    smile,
    eyeShoot,
    label,
  };
}
