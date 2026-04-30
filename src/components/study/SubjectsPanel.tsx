import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useStudyData } from "@/lib/study-store";

export function SubjectsPanel() {
  const { data, addSubject, removeSubject } = useStudyData();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", goalHours: 20 });

  const add = async () => {
    if (!draft.name) return;
    await addSubject(draft.name, draft.goalHours);
    setDraft({ name: "", goalHours: 20 });
    setAdding(false);
  };

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Cognitive State / Mastery
        </h3>
        <button
          onClick={() => setAdding((v) => !v)}
          className="size-8 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition"
          aria-label="Add subject"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {adding && (
        <div className="mb-5 p-3 rounded-xl glass flex gap-2">
          <input
            placeholder="Subject name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="flex-1 bg-transparent border border-glass-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary"
          />
          <input
            type="number"
            min={1}
            value={draft.goalHours}
            onChange={(e) => setDraft({ ...draft, goalHours: Number(e.target.value) })}
            className="w-20 bg-transparent border border-glass-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-primary text-mono"
          />
          <button
            onClick={add}
            className="px-3 rounded-lg bg-primary text-primary-foreground text-xs uppercase font-semibold"
          >
            Add
          </button>
        </div>
      )}

      <div className="space-y-5">
        {data.subjects.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No subjects yet. Add one to start tracking goals.
          </p>
        )}
        {data.subjects.map((s) => {
          const pct = Math.min(100, Math.round((s.completedHours / Math.max(1, s.goalHours)) * 100));
          return (
            <div key={s.id} className="group">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: `var(--${s.color})`, boxShadow: `0 0 8px var(--${s.color})` }}
                  />
                  <p className="text-sm text-foreground">{s.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-mono text-xs text-muted-foreground">
                    {s.completedHours}/{s.goalHours}h
                  </span>
                  <span className="text-mono text-xs" style={{ color: `var(--${s.color})` }}>
                    {pct}%
                  </span>
                  <button
                    onClick={() => removeSubject(s.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                    aria-label="Remove"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: `var(--${s.color})`,
                    boxShadow: `0 0 10px color-mix(in oklab, var(--${s.color}) 60%, transparent)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
