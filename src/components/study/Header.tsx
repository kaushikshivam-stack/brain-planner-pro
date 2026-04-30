import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useStudyData } from "@/lib/study-store";
import { todayStr } from "@/lib/study-store";

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

  return (
    <nav className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10">
      <div className="space-y-1">
        <h1 className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground">
          System / Noesis v1.0
        </h1>
        <p className="text-xl sm:text-2xl font-light text-foreground">
          Welcome back, <span className="text-foreground font-medium">{name}</span>. Cognitive load is{" "}
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

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Local Time</p>
          <p className="text-mono text-2xl font-light text-foreground">
            {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
          </p>
        </div>
        <button
          onClick={signOut}
          className="size-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-destructive transition"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </nav>
  );
}
