import { Flame } from "lucide-react";
import { computeStreak, useStudyData } from "@/lib/study-store";

export function StreakBadge() {
  const { data, hydrated } = useStudyData();
  if (!hydrated) return null;

  const streak = computeStreak(data.schedule);
  const active = streak > 0;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-mono text-xs ${
        active
          ? "border-warning/40 bg-warning/10 text-warning"
          : "border-glass-border text-muted-foreground"
      }`}
      title={
        active
          ? `${streak}-day streak — saare scheduled blocks complete`
          : "Aaj ke saare blocks complete karo to streak start ho"
      }
    >
      <Flame className={`size-3.5 ${active ? "" : "opacity-50"}`} />
      <span className="font-semibold">{streak}</span>
      <span className="text-[10px] uppercase tracking-widest opacity-70">day</span>
    </div>
  );
}
