import { CheckCircle2, Circle, Plus } from "lucide-react";
import { useState } from "react";
import { todayStr, uid, useStudyData } from "@/lib/study-store";

export function ScheduleList() {
  const { data, setData, hydrated } = useStudyData();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ startTime: "09:00", endTime: "10:00", subject: "", topic: "" });

  const today = todayStr();
  const blocks = data.schedule
    .filter((b) => b.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const toggle = (id: string) =>
    setData((d) => ({
      ...d,
      schedule: d.schedule.map((b) => (b.id === id ? { ...b, done: !b.done } : b)),
    }));

  const add = () => {
    if (!draft.subject || !draft.topic) return;
    setData((d) => ({
      ...d,
      schedule: [...d.schedule, { id: uid(), date: today, ...draft, done: false }],
    }));
    setDraft({ startTime: "09:00", endTime: "10:00", subject: "", topic: "" });
    setAdding(false);
  };

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">The Path / Today</h3>
          <p className="text-mono text-xs text-foreground/70">
            {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" })}
          </p>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="size-8 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition"
          aria-label="Add block"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {adding && (
        <div className="mb-5 p-4 rounded-xl glass space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              value={draft.startTime}
              onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
              className="bg-transparent border border-glass-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
            <input
              type="time"
              value={draft.endTime}
              onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
              className="bg-transparent border border-glass-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <input
            placeholder="Subject"
            value={draft.subject}
            onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
            className="w-full bg-transparent border border-glass-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary"
          />
          <input
            placeholder="Topic"
            value={draft.topic}
            onChange={(e) => setDraft({ ...draft, topic: e.target.value })}
            className="w-full bg-transparent border border-glass-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={add}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs uppercase tracking-widest font-semibold"
          >
            Add Block
          </button>
        </div>
      )}

      <ul className="space-y-1">
        {hydrated && blocks.length === 0 && (
          <li className="text-sm text-muted-foreground py-6 text-center">
            No blocks scheduled. Add one or ask the AI co-pilot below.
          </li>
        )}
        {blocks.map((b, i) => {
          const active = !b.done && i === blocks.findIndex((x) => !x.done);
          return (
            <li key={b.id} className="relative group">
              <div
                className={`flex items-start gap-3 pl-5 py-3 border-l ${
                  active ? "border-primary" : b.done ? "border-accent/40" : "border-white/5"
                }`}
              >
                {active && (
                  <span className="absolute -left-[5px] top-4 size-2.5 rounded-full bg-primary glow-primary" />
                )}
                <button onClick={() => toggle(b.id)} className="mt-0.5 shrink-0">
                  {b.done ? (
                    <CheckCircle2 className="size-4 text-accent" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground hover:text-foreground transition" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-mono text-[10px] text-muted-foreground mb-0.5">
                    {active ? "ACTIVE · " : ""}
                    {b.startTime} — {b.endTime}
                  </p>
                  <p className={`text-sm font-medium ${b.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {b.subject}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{b.topic}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
