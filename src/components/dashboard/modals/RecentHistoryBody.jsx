import { Text } from "@mantine/core";
import { useDashboardLiveSession } from "../../../hooks/useDashboardLiveSession.js";

export function RecentHistoryBody() {
  const { emotionSessionHistory } = useDashboardLiveSession();

  if (!emotionSessionHistory.length) {
    return (
      <Text size="sm" c="dimmed">
        Activa la cámara: aquí se irá guardando cada segundo la emoción detectada
        durante la sesión.
      </Text>
    );
  }

  return (
    <div className="history-list history-list--modal">
      {emotionSessionHistory.map((item) => (
        <div
          key={`${item.seq}-${item.time}`}
          className="history-item"
        >
          <span style={{ color: item.color }}>{item.emoji}</span>
          <Text size="xs">{item.time}</Text>
          <Text size="xs">{item.label}</Text>
        </div>
      ))}
    </div>
  );
}
