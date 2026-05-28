/**
 * Avatares de perfil: PNG en `public/assets/avatars/` (URL `/assets/avatars/avatar-XXX.png`).
 *
 * Sexo en el modal (Hombre / Mujer): `src/data/avatarGenderMap.json` (`male` | `female`).
 */

import avatarGenderMap from "./avatarGenderMap.json";

const BASE =
  typeof import.meta !== "undefined" && import.meta.env?.BASE_URL
    ? `${import.meta.env.BASE_URL}`.replace(/\/?$/, "/")
    : "/";

function localAvatar(filename) {
  return `${BASE}assets/avatars/${filename}`;
}

export const PROFILE_AVATAR_COUNT = 66;

export const PROFILE_AVATARS = Array.from(
  { length: PROFILE_AVATAR_COUNT },
  (_, i) => {
    const n = i + 1;
    const pad = String(n).padStart(3, "0");
    const id = `avatar-${pad}`;
    const raw = avatarGenderMap[id];
    const gender = raw === "female" || raw === "male" ? raw : "male";
    return {
      id,
      label: `#${pad}`,
      gender,
      imageSrc: localAvatar(`avatar-${pad}.webp`),
    };
  },
);

export const PROFILE_AVATARS_MALE = PROFILE_AVATARS.filter(
  (a) => a.gender === "male",
);
export const PROFILE_AVATARS_FEMALE = PROFILE_AVATARS.filter(
  (a) => a.gender === "female",
);

export function getProfileAvatarById(id) {
  return PROFILE_AVATARS.find((a) => a.id === id) ?? PROFILE_AVATARS[0];
}
