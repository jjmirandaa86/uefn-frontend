import { useDashboardLiveSession } from "../../hooks/useDashboardLiveSession.js";
import { ApproximateInfoCard } from "./left/ApproximateInfoCard.jsx";
import { ConfidenceInsightCard } from "./left/ConfidenceInsightCard.jsx";
import { CurrentEmotionCard } from "./left/CurrentEmotionCard.jsx";

function GlassCard({ children, className = "" }) {
  return <section className={`glass-card ${className}`}>{children}</section>;
}

export function DashboardLeftColumn() {
  const { liveEmotion, detectedSessionDuration } = useDashboardLiveSession();

  return (
    <aside className="left-column">
      <GlassCard>
        <CurrentEmotionCard
          emotion={liveEmotion}
          detectedDuration={detectedSessionDuration}
        />
      </GlassCard>

      <GlassCard>
        <ConfidenceInsightCard
          value={liveEmotion.confidence}
          ringColor={liveEmotion.color}
        />
      </GlassCard>

      <GlassCard>
        <ApproximateInfoCard />
      </GlassCard>
    </aside>
  );
}
