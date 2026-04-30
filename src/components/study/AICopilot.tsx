import { useState } from "react";
import { Sparkles, ArrowUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStudyData } from "@/lib/study-store";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Kal kya padhna hai?",
  "Summarize today's progress",
  "Suggest a 2-hour study block",
];

export function AICopilot() {
  const { data } = useStudyData();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const ask = async (q?: string) => {
    const question = (q ?? input).trim();
    if (!question) return;
    setLoading(true);
    setResponse(null);
    try {
      const { data: result, error } = await supabase.functions.invoke("study-ai", {
        body: {
          question,
          context: {
            subjects: data.subjects.map((s) => ({
              name: s.name,
              completedHours: s.completedHours,
              goalHours: s.goalHours,
            })),
            todaySchedule: data.schedule
              .filter((b) => b.date === new Date().toISOString().slice(0, 10))
              .map((b) => ({
                time: `${b.startTime}-${b.endTime}`,
                subject: b.subject,
                topic: b.topic,
                done: b.done,
              })),
          },
        },
      });
      if (error) throw error;
      setResponse(result?.answer ?? "No response.");
      setInput("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to reach co-pilot";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {response && (
        <div className="mb-4 glass rounded-2xl p-5 relative">
          <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-[0.2em] text-primary">
            <Sparkles className="size-3" />
            Co-pilot Response
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{response}</p>
          <button
            onClick={() => setResponse(null)}
            className="absolute top-3 right-4 text-xs text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
      )}

      <div className="relative group">
        <div className="absolute -inset-2 bg-primary/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="relative glass rounded-2xl p-1.5 flex items-center transition-all focus-within:border-primary/50">
          <div className="pl-5 pr-3 text-primary">
            <Sparkles className="size-4" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="Kal kya padhna hai? Ask your study co-pilot..."
            disabled={loading}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 text-base font-light py-3"
          />
          <button
            onClick={() => ask()}
            disabled={loading || !input.trim()}
            className="size-10 mr-1.5 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition glow-primary"
            aria-label="Send"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
            disabled={loading}
            className="px-3 py-1.5 rounded-full glass text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary hover:border-primary/30 transition"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
