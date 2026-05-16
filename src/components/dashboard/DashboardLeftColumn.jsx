import { ApproximateInfoCard } from "./left/ApproximateInfoCard.jsx";
import { ConfidenceInsightCard } from "./left/ConfidenceInsightCard.jsx";
import { CurrentEmotionCard } from "./left/CurrentEmotionCard.jsx";

function GlassCard({ children, className = "" }) {
  return <section className={`glass-card ${className}`}>{children}</section>;
}

export function DashboardLeftColumn({ emotion }) {
  return (
    <aside className="left-column">
      <GlassCard>
        <CurrentEmotionCard emotion={emotion} />
      </GlassCard>

      <GlassCard>
        <ConfidenceInsightCard value={emotion.confidence} />
      </GlassCard>

      <GlassCard>
        <ApproximateInfoCard />
      </GlassCard>
    </aside>
  );
}
