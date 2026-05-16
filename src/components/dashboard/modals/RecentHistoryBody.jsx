import { Text } from "@mantine/core";
import { recentHistory } from "../../../data/emotions";

export function RecentHistoryBody() {
  return (
    <div className="history-list history-list--modal">
      {recentHistory.map((item) => (
        <div key={`${item.time}-${item.label}`} className="history-item">
          <span style={{ color: item.color }}>{item.emoji}</span>
          <Text size="xs">{item.time}</Text>
          <Text size="xs">{item.label}</Text>
        </div>
      ))}
    </div>
  );
}
