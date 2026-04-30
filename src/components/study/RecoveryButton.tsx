import { LifeBuoy, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMissedBlocks, todayStr, useStudyData } from "@/lib/study-store";

export function RecoveryButton() {
  const { data, addBlocksBulk } = useStudyData();
  const [loading, setLoading] = useState(false);

  const missed = getMissedBlocks(data.schedule);
  if (missed.length === 0) return null;

  const recover = async () => {
    setLoading(true);
    try {
      const today = todayStr();
      const payload = {
        mode: "recovery",
        today,
        dailyHours: 4,
        preferredStart: "09:00",
        missedBlocks: missed.map((b) => ({
          subject: b.subject,
          topic: b.topic,
          originalDate: b.date,
        })),
        subjects: data.subjects.map((s) => ({
          name: s.name,
          examDate: s.examDate ?? null,
          isWeak: s.isWeak,
        })),
        horizonDays: 14,
      };
      const { data: plan, error } = await supabase.functions.invoke("study-plan", { body: payload });
      if (error) throw error;
      if (plan?.error) throw new Error(plan.error);
      const blocks = plan?.blocks ?? [];
      if (blocks.length === 0) throw new Error("No recovery plan");

      // Delete the missed undone blocks (they are now redistributed)
      const ids = missed.map((b) => b.id);
      if (ids.length > 0) {
        await supabase.from("schedule_blocks").delete().in("id", ids);
      }
      await addBlocksBulk(blocks);
      toast.success(`${missed.length} missed blocks → ${blocks.length} new slots`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Recovery failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={recover}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/15 border border-warning/30 text-warning text-xs uppercase tracking-widest font-semibold hover:bg-warning/25 transition disabled:opacity-50"
      title={`${missed.length} missed blocks`}
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <LifeBuoy className="size-3.5" />}
      Recover {missed.length}
    </button>
  );
}
