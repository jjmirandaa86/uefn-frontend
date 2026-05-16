export const emotions = [
  {
    key: "happy",
    label: "Feliz",
    emoji: "😀",
    color: "#22c55e",
    confidence: 92,
  },
  {
    key: "neutral",
    label: "Neutral",
    emoji: "😐",
    color: "#94a3b8",
    confidence: 25,
  },
  {
    key: "sad",
    label: "Triste",
    emoji: "😢",
    color: "#38bdf8",
    confidence: 10,
  },
  {
    key: "angry",
    label: "Enojado",
    emoji: "😡",
    color: "#ef4444",
    confidence: 5,
  },
  {
    key: "surprised",
    label: "Sorprendido",
    emoji: "😲",
    color: "#a855f7",
    confidence: 7,
  },
  {
    key: "disgusted",
    label: "Disgusto",
    emoji: "🤢",
    color: "#84cc16",
    confidence: 5,
  },
];

/** Mismo shape que guarda `useEmotionHistoryRecorder` (`seq` lo añade el hook en vivo). */
export const emotionHistoryEntryExamples = [
  { time: "10:45", label: "Feliz", emoji: "😀", color: "#22c55e" },
  { time: "10:44", label: "Feliz", emoji: "😀", color: "#22c55e" },
  { time: "10:43", label: "Neutral", emoji: "😐", color: "#94a3b8" },
  { time: "10:42", label: "Sorprendido", emoji: "😲", color: "#a855f7" },
  { time: "10:41", label: "Feliz", emoji: "😀", color: "#22c55e" },
  { time: "10:40", label: "Triste", emoji: "😢", color: "#38bdf8" },
  { time: "10:39", label: "Neutral", emoji: "😐", color: "#94a3b8" },
  { time: "10:38", label: "Cansado", emoji: "😴", color: "#f59e0b" },
];

/** @deprecated Usar `emotionSessionHistory` del dashboard; se mantiene por compatibilidad. */
export const recentHistory = emotionHistoryEntryExamples;

export const emotionTrend = [
  { time: "08:00", value: 42, emoji: "😐" },
  { time: "09:00", value: 58, emoji: "😀" },
  { time: "10:00", value: 72, emoji: "😀" },
  { time: "11:00", value: 39, emoji: "😢" },
  { time: "12:00", value: 85, emoji: "😀" },
  { time: "13:00", value: 48, emoji: "😐" },
  { time: "14:00", value: 66, emoji: "😲" },
  { time: "15:00", value: 35, emoji: "😡" },
  { time: "16:00", value: 73, emoji: "😀" },
  { time: "18:00", value: 51, emoji: "😴" },
];
