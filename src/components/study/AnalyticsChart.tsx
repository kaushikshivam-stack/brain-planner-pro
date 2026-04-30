import { useStudyData } from "@/lib/study-store";

export function AnalyticsChart() {
  const { data } = useStudyData();

  // Aggregate last 7 days
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const totals = days.map((day) =>
    data.sessions.filter((s) => s.date === day).reduce((acc, s) => acc + s.minutes, 0),
  );
  const max = Math.max(60, ...totals);
  const totalMin = totals.reduce((a, b) => a + b, 0);
  const avgHours = (totalMin / 60 / 7).toFixed(1);

  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const todayIdx = 6;

  return (
    <section className="glass rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Focus Velocity
        </h3>
        <span className="text-mono text-[10px] text-muted-foreground">7d</span>
      </div>

      <div className="flex-1 flex items-end gap-1.5 min-h-32">
        {totals.map((mins, i) => {
          const h = Math.max(4, (mins / max) * 100);
          const isToday = i === todayIdx;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
              <span className="text-mono text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition">
                {(mins / 60).toFixed(1)}h
              </span>
              <div
                className={`w-full rounded-t-md transition-all ${
                  isToday ? "bg-primary" : "bg-primary/20 group-hover:bg-primary/40"
                }`}
                style={{
                  height: `${h}%`,
                  boxShadow: isToday ? "0 0 14px color-mix(in oklab, var(--primary) 50%, transparent)" : undefined,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-3">
        {labels.map((l, i) => (
          <span
            key={i}
            className={`text-[10px] font-medium flex-1 text-center ${
              i === todayIdx ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {l}
          </span>
        ))}
      </div>

      <div className="pt-4 mt-4 border-t border-glass-border">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Daily Average</p>
        <p className="text-mono text-2xl font-light text-foreground">{avgHours}<span className="text-sm text-muted-foreground"> hrs</span></p>
      </div>
    </section>
  );
}
