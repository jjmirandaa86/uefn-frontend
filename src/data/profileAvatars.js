/**
 * Avatares de perfil: PNG recortados desde la hoja de sprites del proyecto.
 * Archivos en `public/assets/avatars/` (URL `/assets/avatars/avatar-XXX.png`).
 *
 * Genero de sprites: `npm run split-avatars` (hoja en `scripts/avatar-sprite-source.png`).
 *
 * **Sexo / fila en el modal (Hombre vs Mujer):** edita `src/data/avatarGenderMap.json`
 * (`male` o `female` por cada `avatar-XXX`).
 */

import avatarGenderMap from "./avatarGenderMap.json";

const BASE =
  typeof import.meta !== "undefined" && import.meta.env?.BASE_URL
    ? `${import.meta.env.BASE_URL}`.replace(/\/?$/, "/")
    : "/";

function localAvatar(filename) {
  return `${BASE}assets/avatars/${filename}`;
}

/** Cantidad de PNG generados por `npm run split-avatars` (rejilla 9x9 + recortes). */
export const SPRITE_AVATAR_COUNT = 66;

export const PROFILE_AVATARS = Array.from({ length: SPRITE_AVATAR_COUNT }, (_, i) => {
  const n = i + 1;
  const pad = String(n).padStart(3, "0");
  const id = `avatar-${pad}`;
  const raw = avatarGenderMap[id];
  const gender = raw === "female" || raw === "male" ? raw : "male";
  return {
    id,
    label: `#${pad}`,
    gender,
    gradient: { from: "dark", to: "gray", deg: 135 },
    imageSrc: localAvatar(`avatar-${pad}.png`),
  };
});

export const PROFILE_AVATARS_MALE = PROFILE_AVATARS.filter((a) => a.gender === "male");
export const PROFILE_AVATARS_FEMALE = PROFILE_AVATARS.filter((a) => a.gender === "female");

export function getProfileAvatarById(id) {
  return PROFILE_AVATARS.find((a) => a.id === id) ?? PROFILE_AVATARS[0];
}
