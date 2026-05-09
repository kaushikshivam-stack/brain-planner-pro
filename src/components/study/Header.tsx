import { LogOut, Loader2, Bot } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useStudyData } from "@/lib/study-store";
import { todayStr } from "@/lib/study-store";
import { RemindersBell } from "@/components/study/RemindersBell";
import { TimetableGenerator } from "@/components/study/TimetableGenerator";
import { RecoveryButton } from "@/components/study/RecoveryButton";
import { StreakBadge } from "@/components/study/StreakBadge";
import { RewardsPanel } from "@/components/study/RewardsPanel";

export function Header() {
  const { user, signOut } = useAuth();
  const { data, hydrated } = useStudyData();

  const today = todayStr();
  const blocks = data.schedule.filter((b) => b.date === today);
  const done = blocks.filter((b) => b.done).length;
  const remaining = blocks.length - done;

  const totalMins = data.sessions
    .filter((s) => s.date === today)
    .reduce((a, b) => a + b.minutes, 0);

  const status = !hydrated ? "syncing" : remaining === 0 && blocks.length > 0 ? "complete" : totalMins > 60 ? "optimal" : "warming up";
  const color =
    status === "optimal" ? "text-primary" : status === "complete" ? "text-accent" : status === "syncing" ? "text-muted-foreground" : "text-warning";

  const name = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Burning midnight oil" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Late night focus";

  return (
    <nav className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 animate-[fade-in_0.6s_ease-out]">
      <div className="space-y-1 flex items-start gap-3">
        <div className="relative shrink-0 mt-1 group">
          <div className="absolute inset-0 rounded-2xl bg-primary/40 blur-xl animate-[ai-pulse_3s_ease-in-out_infinite]" />
          <div className="relative size-12 rounded-2xl glass border border-primary/40 flex items-center justify-center text-primary glow-primary overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
            <Bot className="size-5 relative z-10 animate-[float_4s_ease-in-out_infinite]" />
            <span className="absolute bottom-1 right-1 size-2 rounded-full bg-accent shadow-[0_0_8px_var(--accent)] animate-pulse" />
          </div>
        </div>
        <div className="space-y-1">
        <h1 className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground">
          System / Noesis v1.0 · {greeting}
        </h1>
        <p className="text-xl sm:text-2xl font-light text-foreground">
          {greeting}, <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-medium animate-[shimmer_6s_linear_infinite] bg-[length:200%_auto]">{name}</span>. Cognitive load is{" "}
          <span className={`${color} font-medium inline-flex items-center gap-1.5`}>
            {!hydrated && <Loader2 className="size-3.5 animate-spin" />}
            {status}
          </span>.
        </p>
        {hydrated && blocks.length > 0 && (
          <p className="text-xs text-muted-foreground text-mono">
            {done}/{blocks.length} blocks complete · {(totalMins / 60).toFixed(1)}h focused today
          </p>
        )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        <StreakBadge />
        <RewardsPanel />
        <RecoveryButton />
        <TimetableGenerator />
        <div className="text-right ml-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Local Time</p>
          <p className="text-mono text-2xl font-light text-foreground">
            {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
          </p>
        </div>
        <RemindersBell />
        <button
          onClick={signOut}
          className="size-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:scale-105 transition-all"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </nav>
  );
}
