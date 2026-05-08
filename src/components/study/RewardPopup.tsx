import { useEffect, useState } from "react";
import { Sparkles, Trophy, Zap, Star, Flame, Target, Brain, Crown, Clock, Hourglass, Award } from "lucide-react";
import { onReward } from "@/lib/rewards-store";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Trophy, Zap, Star, Flame, Target, Brain, Crown, Clock, Hourglass, Award,
};

type Popup = {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "xp" | "level" | "achievement";
};

let nextId = 1;

export function RewardPopup() {
  const [popups, setPopups] = useState<Popup[]>([]);

  useEffect(() => {
    return onReward((e) => {
      let p: Popup;
      if (e.type === "xp") {
        p = { id: nextId++, title: `+${e.amount} XP`, subtitle: "Focus session logged", icon: Sparkles, variant: "xp" };
      } else if (e.type === "levelup") {
        p = { id: nextId++, title: `Level ${e.level}`, subtitle: "You ascended", icon: Zap, variant: "level" };
      } else {
        p = { id: nextId++, title: e.name, subtitle: e.desc, icon: ICONS[e.icon] ?? Trophy, variant: "achievement" };
      }
      setPopups((prev) => [...prev, p]);
      setTimeout(() => setPopups((prev) => prev.filter((x) => x.id !== p.id)), e.type === "xp" ? 2400 : 4200);
    });
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {popups.map((p) => {
        const Icon = p.icon;
        const ring =
          p.variant === "achievement"
            ? "border-warning/50 shadow-[0_0_40px_-8px_var(--warning)]"
            : p.variant === "level"
              ? "border-accent/50 shadow-[0_0_40px_-8px_var(--accent)]"
              : "border-primary/50 shadow-[0_0_30px_-8px_var(--primary)]";
        const iconColor =
          p.variant === "achievement" ? "text-warning" : p.variant === "level" ? "text-accent" : "text-primary";
        return (
          <div
            key={p.id}
            className={`glass border ${ring} rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[260px] animate-[reward-in_0.5s_cubic-bezier(0.2,0.9,0.3,1.4)] relative overflow-hidden`}
          >
            <div className={`absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-current to-transparent ${iconColor} animate-[reward-shine_2s_ease-in-out_infinite] pointer-events-none`} />
            <div className={`size-10 rounded-xl flex items-center justify-center bg-glass border border-glass-border ${iconColor} animate-[reward-pulse_1.5s_ease-in-out_infinite]`}>
              <Icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${iconColor}`}>{p.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{p.subtitle}</p>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes reward-in {
          0% { transform: translateX(120%) scale(0.9); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes reward-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px currentColor); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 12px currentColor); }
        }
        @keyframes reward-shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
