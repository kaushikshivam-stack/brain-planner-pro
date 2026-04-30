import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useStudyData } from "@/lib/study-store";

const MODES = {
  focus: { label: "Focus", minutes: 25 },
  short: { label: "Short Break", minutes: 5 },
  long: { label: "Long Break", minutes: 15 },
} as const;

type Mode = keyof typeof MODES;

export function PomodoroTimer() {
  const { logSession } = useStudyData();
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          if (mode === "focus" && startedAt.current) {
            const minutes = MODES.focus.minutes;
            logSession(minutes);
            toast.success(`Nice! ${minutes} min focus session logged.`);
          } else {
            toast(`${MODES[mode].label} complete.`);
          }
          startedAt.current = null;
          return MODES[mode].minutes * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, mode, logSession]);

  const setModeReset = (m: Mode) => {
    setMode(m);
    setSecondsLeft(MODES[m].minutes * 60);
    setRunning(false);
    startedAt.current = null;
  };

  const toggle = () => {
    if (!running) startedAt.current = Date.now();
    setRunning((r) => !r);
  };

  const reset = () => {
    setSecondsLeft(MODES[mode].minutes * 60);
    setRunning(false);
    startedAt.current = null;
  };

  const total = MODES[mode].minutes * 60;
  const progress = ((total - secondsLeft) / total) * 100;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="glass rounded-2xl p-6 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className={`size-1.5 rounded-full ${running ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`} />
        Focus Timer · {MODES[mode].label}
      </div>

      <div className="relative size-44 mb-6">
        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" stroke="var(--glass-border)" strokeWidth="3" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="var(--primary)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 46}
            strokeDashoffset={2 * Math.PI * 46 * (1 - progress / 100)}
            style={{ transition: "stroke-dashoffset 0.6s linear", filter: "drop-shadow(0 0 6px var(--primary))" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-mono text-5xl font-light text-foreground">
            {mm}:{ss}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={toggle}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:opacity-90 transition glow-primary"
        >
          {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={reset}
          className="px-3 py-2.5 rounded-xl glass text-muted-foreground hover:text-foreground transition"
          aria-label="Reset"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      <div className="flex gap-1 text-[10px] uppercase tracking-widest">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setModeReset(m)}
            className={`px-3 py-1.5 rounded-lg transition ${
              mode === m ? "bg-glass text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>
    </div>
  );
}
