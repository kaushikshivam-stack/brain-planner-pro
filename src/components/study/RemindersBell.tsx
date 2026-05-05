import { Bell } from "lucide-react";
import { useState } from "react";
import { useReminders } from "@/lib/use-reminders";

export function RemindersBell() {
  const { reminders, unread, markAllRead, clear, snooze, snoozeOptions } = useReminders();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (next && unread > 0) markAllRead();
      return next;
    });
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="size-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition relative"
        aria-label="Reminders"
        title="Reminders"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center glow-primary">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:inset-x-auto max-h-[70vh] sm:max-h-96 overflow-auto glass rounded-2xl p-3 z-50 border border-glass-border bg-background/95 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Reminders</p>
              {reminders.length > 0 && (
                <button onClick={clear} className="text-[10px] text-muted-foreground hover:text-foreground">
                  Clear
                </button>
              )}
            </div>
            {reminders.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No reminders yet. You'll be pinged 10 min before each block.
              </p>
            ) : (
              <ul className="space-y-1">
                {reminders.map((r) => (
                  <li key={r.id} className="p-2 rounded-lg hover:bg-white/[0.03] transition">
                    <p className="text-sm font-medium text-foreground break-words">{r.title}</p>
                    <p className="text-xs text-muted-foreground break-words">{r.body}</p>
                    <div className="flex items-center justify-between flex-wrap gap-2 mt-1.5">
                      <p className="text-[10px] text-muted-foreground/60 text-mono">
                        {new Date(r.at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 mr-1">Snooze</span>
                        {snoozeOptions.map((m) => (
                          <button
                            key={m}
                            onClick={() => snooze(r.blockId, r.kind, m)}
                            className="px-1.5 py-0.5 rounded-md text-[10px] text-mono text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition"
                            title={`Snooze ${m} minutes`}
                          >
                            {m}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
