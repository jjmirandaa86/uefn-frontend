import { useMemo } from "react";
import { Text } from "@mantine/core";
import { useRecentEmotionHistory } from "../../../hooks/useRecentEmotionHistory.js";
import { groupHistoryItemsByDate } from "../../../utils/emotionHistoryDisplay.js";

function HistoryItemCard({ item }) {
  return (
    <div className="history-item" style={{ borderBottomColor: item.color }}>
      <span style={{ color: item.color, fontSize: "30px" }}>{item.emoji}</span>
      <Text size="xs">{item.time}</Text>
      <Text size="xs" c="dimmed">
        {item.nivelConfianza}%
      </Text>
    </div>
  );
}

export function RecentHistoryBody({ active = true }) {
  const { items, loading, error, limit } = useRecentEmotionHistory({
    enabled: active,
  });

  const groups = useMemo(() => groupHistoryItemsByDate(items), [items]);
  const showDateHeaders = groups.length > 1;

  if (loading && !items.length) {
    return (
      <Text size="sm" c="dimmed">
        Cargando historial…
      </Text>
    );
  }

  if (error) {
    return (
      <Text size="sm" c="red.4">
        {error}
      </Text>
    );
  }

  if (!items.length) {
    return (
      <Text size="sm" c="dimmed">
        Activa la cámara: aquí aparecerán las últimas {limit} emociones
        guardadas en el servidor.
      </Text>
    );
  }

  return (
    <div className="history-modal-body">
      {groups.map((group) => (
        <section key={group.dateKey} className="history-date-group">
          {showDateHeaders ? (
            <Text className="history-date-heading" size="xs" fw={700}>
              {group.dateLabel}
            </Text>
          ) : null}
          <div className="history-list history-list--modal">
            {group.items.map((item) => (
              <HistoryItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
