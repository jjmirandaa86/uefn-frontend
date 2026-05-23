import {
  IconCalendarEvent,
  IconChartDots,
  IconClock,
  IconHome,
  IconMoodSmile,
  IconUser,
} from "@tabler/icons-react";

export const NAV_ITEMS = [
  { id: "inicio", icon: IconHome, label: "Inicio" },
  { id: "historial", icon: IconClock, label: "Historial Reciente" },
  { id: "emociones-hoy", icon: IconCalendarEvent, label: "Emociones de hoy" },
  { id: "estadisticas", icon: IconChartDots, label: "Datos Históricos" },
  { id: "game", icon: IconUser, label: "Juego" },
  {
    id: "momentos-divertidos",
    icon: IconMoodSmile,
    label: "Momentos divertidos",
  },
  { id: "perfil", icon: IconUser, label: "Perfil" },
];
