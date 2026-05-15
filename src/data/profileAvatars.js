import { IconGenderFemale, IconGenderMale } from '@tabler/icons-react';

/**
 * Opciones de avatar para el modal de perfil (mezcla estilos asociados a hombre / mujer).
 * `Icon` es un componente de Tabler para mostrar dentro del Avatar.
 */
export const PROFILE_AVATARS = [
  {
    id: 'violet-cyan',
    label: 'Hombre',
    Icon: IconGenderMale,
    gradient: { from: 'violet', to: 'cyan', deg: 125 },
  },
  {
    id: 'f-rose',
    label: 'Mujer',
    Icon: IconGenderFemale,
    gradient: { from: 'pink', to: 'violet', deg: 135 },
  },
  {
    id: 'm-slate',
    label: 'Hombre',
    Icon: IconGenderMale,
    gradient: { from: 'gray', to: 'blue', deg: 110 },
  },
  {
    id: 'f-sun',
    label: 'Mujer',
    Icon: IconGenderFemale,
    gradient: { from: 'orange', to: 'red', deg: 125 },
  },
  {
    id: 'm-forest',
    label: 'Hombre',
    Icon: IconGenderMale,
    gradient: { from: 'teal', to: 'lime', deg: 115 },
  },
  {
    id: 'f-lilac',
    label: 'Mujer',
    Icon: IconGenderFemale,
    gradient: { from: 'grape', to: 'pink', deg: 140 },
  },
];

export function getProfileAvatarById(id) {
  return PROFILE_AVATARS.find((a) => a.id === id) ?? PROFILE_AVATARS[0];
}
