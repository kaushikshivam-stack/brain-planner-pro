import { Sparkles, X, Loader2, AlertCircle, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { todayStr, useStudyData } from "@/lib/study-store";

export function TimetableGenerator() {
  const { user } = useAuth();
  const { data, updateSubject, addBlocksBulk } = useStudyData();
  const [open, setOpen] = useState(false);
  const [dailyHours, setDailyHours] = useState(4);
  const [preferredStart, setPreferredStart] = useState("09:00");
  const [generating, setGenerating] = useState(false);

  // Local edit buffer for exam dates / weak flags
  const [edits, setEdits] = useState<Record<string, { examDate: string; isWeak: boolean }>>({});

  useEffect(() => {
    if (!open) return;
    // Load profile prefs
    (async () => {
      if (!user) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("daily_hours, preferred_start")
        .eq("user_id", user.id)
        .maybeSingle();
      if (prof) {
        setDailyHours(Number(prof.daily_hours) || 4);
        setPreferredStart(prof.preferred_start || "09:00");
      }
      // Seed edits from current subjects
      const seed: Record<string, { examDate: string; isWeak: boolean }> = {};
      for (const s of data.subjects) {
        seed[s.id] = { examDate: s.examDate ?? "", isWeak: s.isWeak };
      }
      setEdits(seed);
    })();
  }, [open, user, data.subjects]);

  const generate = async () => {
    if (!user) return;
    const subjectsWithExams = data.subjects.filter((s) => edits[s.id]?.examDate);
    if (subjectsWithExams.length === 0) {
      toast.error("Kam se kam ek subject ki exam date set karo");
      return;
    }
    setGenerating(true);
    try {
      // Save prefs + subject edits
      await supabase
        .from("profiles")
        .update({ daily_hours: dailyHours, preferred_start: preferredStart })
        .eq("user_id", user.id);
      for (const s of data.subjects) {
        const e = edits[s.id];
        if (!e) continue;
        if ((s.examDate ?? "") !== e.examDate || s.isWeak !== e.isWeak) {
          await updateSubject(s.id, { examDate: e.examDate || null, isWeak: e.isWeak });
        }
      }

      const today = todayStr();
      const payload = {
        mode: "timetable",
        today,
        dailyHours,
        preferredStart,
        subjects: subjectsWithExams.map((s) => ({
          name: s.name,
          examDate: edits[s.id].examDate,
          isWeak: edits[s.id].isWeak,
          completedHours: s.completedHours,
          goalHours: s.goalHours,
        })),
        horizonDays: 30,
      };

      const { data: planData, error } = await supabase.functions.invoke("study-plan", {
        body: payload,
      });
      if (error) throw error;
      if (planData?.error) throw new Error(planData.error);
      const blocks = planData?.blocks ?? [];
      if (blocks.length === 0) throw new Error("Plan empty");

      await addBlocksBulk(blocks, { replaceFutureFrom: today });
      toast.success(`${blocks.length} blocks generated · ${planData.summary ?? ""}`);
      setOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition"
      >
        <Sparkles className="size-3.5" />
        AI Timetable
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              AI Planner
            </h3>
            <p className="text-lg font-light mb-5">Build my exam timetable</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Daily hours
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    step={0.5}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="mt-1 w-full bg-transparent border border-glass-border rounded-lg px-3 py-2 text-mono text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Start at
                  </span>
                  <input
                    type="time"
                    value={preferredStart}
                    onChange={(e) => setPreferredStart(e.target.value)}
                    className="mt-1 w-full bg-transparent border border-glass-border rounded-lg px-3 py-2 text-mono text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  Subjects · exam date · weak?
                </p>
                {data.subjects.length === 0 && (
                  <p className="text-sm text-muted-foreground py-3 text-center">
                    Pehle ek subject add karo.
                  </p>
                )}
                <div className="space-y-2">
                  {data.subjects.map((s) => {
                    const e = edits[s.id] ?? { examDate: "", isWeak: false };
                    return (
                      <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg glass">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: `var(--${s.color})` }}
                        />
                        <span className="text-sm flex-1 truncate">{s.name}</span>
                        <input
                          type="date"
                          value={e.examDate}
                          min={todayStr()}
                          onChange={(ev) =>
                            setEdits((p) => ({
                              ...p,
                              [s.id]: { ...e, examDate: ev.target.value },
                            }))
                          }
                          className="bg-transparent border border-glass-border rounded-md px-2 py-1 text-mono text-xs outline-none focus:border-primary"
                        />
                        <button
                          onClick={() =>
                            setEdits((p) => ({
                              ...p,
                              [s.id]: { ...e, isWeak: !e.isWeak },
                            }))
                          }
                          title="Mark as weak subject"
                          className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-widest font-semibold transition ${
                            e.isWeak
                              ? "bg-warning/20 text-warning border border-warning/40"
                              : "border border-glass-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Flame className="size-3 inline -mt-0.5" /> Weak
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertCircle className="size-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Future ke undone blocks replace ho jayenge. Done blocks safe rahenge.
                </p>
              </div>

              <button
                onClick={generate}
                disabled={generating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs uppercase tracking-widest font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {generating ? "Building plan…" : "Generate timetable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
