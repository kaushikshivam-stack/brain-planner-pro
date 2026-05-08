import { useState } from "react";
import {
  Sparkles, Trophy, Zap, Star, Flame, Target, Brain, Crown, Clock, Hourglass, Award, Lock, X,
} from "lucide-react";
import {
  useRewards, ACHIEVEMENTS, xpForLevel, levelFromXp, rankFor, WEEKLY_GOAL,
} from "@/lib/rewards-store";
import { computeStreak, useStudyData } from "@/lib/study-store";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Trophy, Zap, Star, Flame, Target, Brain, Crown, Clock, Hourglass, Award,
};

export function RewardsPanel() {
  const { rewards, unlocked, loaded } = useRewards();
  const { data } = useStudyData();
  const [open, setOpen] = useState(false);

  if (!loaded || !rewards) {
    return (
      <button
        className="size-10 rounded-xl glass flex items-center justify-center text-muted-foreground"
        aria-label="Rewards"
      >
        <Trophy className="size-4" />
      </button>
    );
  }

  const streak = computeStreak(data.schedule);
  const level = rewards.level;
  const xpThis = xpForLevel(level);
  const xpNext = xpForLevel(level + 1);
  const progress = Math.max(0, Math.min(100, ((rewards.xp - xpThis) / (xpNext - xpThis)) * 100));
  const rank = rankFor(level);
  const weeklyPct = Math.min(100, (rewards.weeklyXp / WEEKLY_GOAL) * 100);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative h-10 px-3 rounded-xl glass flex items-center gap-2 text-mono text-xs hover:text-foreground text-muted-foreground transition group"
        aria-label="Rewards"
        title={`Level ${level} · ${rewards.xp} XP`}
      >
        <Trophy className={`size-3.5 ${rank.color} group-hover:animate-pulse`} />
        <span className="font-semibold text-foreground">L{level}</span>
        <span className="opacity-60 hidden sm:inline">{rewards.xp} XP</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass border border-glass-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-[scale-in_0.25s_ease-out] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 size-8 rounded-lg hover:bg-glass flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            <div className="p-6 border-b border-glass-border">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Productivity Rank</p>
              <div className="flex items-end gap-3">
                <h2 className={`text-3xl font-light ${rank.color}`}>{rank.name}</h2>
                <span className="text-mono text-sm text-muted-foreground mb-1">Level {level}</span>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  <span>{rewards.xp} XP</span>
                  <span>{xpNext} XP → L{level + 1}</span>
                </div>
                <div className="h-2 rounded-full bg-glass border border-glass-border overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 relative"
                    style={{ width: `${progress}%`, boxShadow: "0 0 16px var(--primary)" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[reward-shine_2.5s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                <Stat icon={Flame} label="Streak" value={`${streak}d`} accent="text-warning" />
                <Stat icon={Sparkles} label="Sessions" value={String(rewards.totalSessions)} accent="text-primary" />
                <Stat icon={Clock} label="Hours" value={(rewards.totalMinutes / 60).toFixed(1)} accent="text-accent" />
                <Stat icon={Trophy} label="Best Streak" value={`${rewards.longestStreak}d`} accent="text-chart-4" />
              </div>
            </div>

            {/* Weekly Challenge */}
            <div className="p-6 border-b border-glass-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Weekly Challenge</p>
                  <p className="text-sm text-foreground mt-0.5">Earn {WEEKLY_GOAL} XP this week</p>
                </div>
                <span className="text-mono text-xs text-accent font-semibold">
                  {rewards.weeklyXp} / {WEEKLY_GOAL}
                </span>
              </div>
              <div className="h-2 rounded-full bg-glass border border-glass-border overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-warning transition-all duration-700"
                  style={{ width: `${weeklyPct}%`, boxShadow: "0 0 14px var(--accent)" }}
                />
              </div>
              {weeklyPct >= 100 && (
                <p className="text-[11px] text-warning mt-2 flex items-center gap-1.5">
                  <Trophy className="size-3" /> Challenge complete — Weekly Warrior unlocked
                </p>
              )}
            </div>

            {/* Achievements */}
            <div className="p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Achievements · {unlocked.size}/{ACHIEVEMENTS.length}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ACHIEVEMENTS.map((a) => {
                  const Icon = ICONS[a.icon] ?? Trophy;
                  const got = unlocked.has(a.key);
                  return (
                    <div
                      key={a.key}
                      className={`rounded-xl border p-3 flex flex-col items-center text-center transition ${
                        got
                          ? "border-warning/40 bg-warning/5 shadow-[0_0_20px_-10px_var(--warning)]"
                          : "border-glass-border bg-glass opacity-50"
                      }`}
                    >
                      <div
                        className={`size-10 rounded-xl flex items-center justify-center mb-2 ${
                          got ? "text-warning" : "text-muted-foreground"
                        }`}
                        style={got ? { filter: "drop-shadow(0 0 6px var(--warning))" } : undefined}
                      >
                        {got ? <Icon className="size-5" /> : <Lock className="size-4" />}
                      </div>
                      <p className="text-xs font-semibold text-foreground">{a.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{a.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({
  icon: Icon, label, value, accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-glass-border bg-glass p-3">
      <div className={`flex items-center gap-1.5 ${accent} mb-1`}>
        <Icon className="size-3.5" />
        <span className="text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-mono text-lg font-light text-foreground">{value}</p>
    </div>
  );
}
