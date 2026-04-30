// In-app reminder engine. Watches today's schedule blocks and fires
// toast notifications + tracks unread reminders for the bell.
// Supports snoozing reminders by 5/10/15 minutes.
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { todayStr, useStudyData, type ScheduleBlock } from "@/lib/study-store";

export type ReminderKind = "upcoming" | "starting";

export type Reminder = {
  id: string;
  blockId: string;
  title: string;
  body: string;
  at: number;
  read: boolean;
  kind: ReminderKind;
};

type SnoozeEntry = { blockId: string; kind: ReminderKind; until: number };

const STORAGE_KEY = "noesis.reminders.v1";
const FIRED_KEY = "noesis.reminders.fired.v1";
const SNOOZE_KEY = "noesis.reminders.snooze.v1";
const LEAD_MINUTES = 10;
const SNOOZE_OPTIONS = [5, 10, 15] as const;

function loadList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function blockStartMs(b: ScheduleBlock) {
  const [h, m] = b.startTime.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

function snoozeKeyFor(blockId: string, kind: ReminderKind) {
  return `${blockId}:${kind}`;
}

export function useReminders() {
  const { data, hydrated } = useStudyData();
  const [reminders, setReminders] = useState<Reminder[]>(() => loadList<Reminder>(STORAGE_KEY));
  const firedRef = useRef<Set<string>>(new Set(loadList<string>(FIRED_KEY)));
  const snoozeRef = useRef<Map<string, SnoozeEntry>>(
    new Map(loadList<SnoozeEntry>(SNOOZE_KEY).map((s) => [snoozeKeyFor(s.blockId, s.kind), s])),
  );

  // Persist reminder list
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders.slice(-50)));
    }
  }, [reminders]);

  const persistFired = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(firedRef.current)));
    }
  };

  const persistSnooze = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SNOOZE_KEY, JSON.stringify(Array.from(snoozeRef.current.values())));
    }
  };

  const snooze = useCallback((blockId: string, kind: ReminderKind, minutes: number) => {
    const id = `${blockId}:${kind}`;
    const until = Date.now() + minutes * 60_000;
    snoozeRef.current.set(id, { blockId, kind, until });
    // Allow re-fire by clearing the fired marker.
    firedRef.current.delete(id);
    persistSnooze();
    persistFired();
    toast(`Snoozed ${minutes} min`, { description: "We'll ping you again shortly." });
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const tick = () => {
      const now = Date.now();
      const today = todayStr();
      const todayBlocks = data.schedule.filter((b) => b.date === today && !b.done);

      const newOnes: Reminder[] = [];
      const fireReminder = (b: ScheduleBlock, kind: ReminderKind, r: Reminder) => {
        firedRef.current.add(`${b.id}:${kind}`);
        newOnes.push(r);
        const actions = SNOOZE_OPTIONS.map((m) => ({ m })); // placeholder for typing
        // Sonner only shows one action button — use 10 min as default snooze on toast.
        toast(r.title, {
          description: r.body,
          icon: kind === "upcoming" ? "⏳" : "🎯",
          action: {
            label: "Snooze 10m",
            onClick: () => snooze(b.id, kind, 10),
          },
        });
        void actions;
      };

      for (const b of todayBlocks) {
        const start = blockStartMs(b);

        for (const kind of ["upcoming", "starting"] as ReminderKind[]) {
          const id = `${b.id}:${kind}`;
          const snoozed = snoozeRef.current.get(id);
          if (snoozed && snoozed.until > now) continue;
          if (snoozed && snoozed.until <= now) {
            snoozeRef.current.delete(id);
            persistSnooze();
          }
          if (firedRef.current.has(id)) continue;

          if (kind === "upcoming") {
            const minsUntil = Math.round((start - now) / 60000);
            if (minsUntil <= LEAD_MINUTES && minsUntil > 0) {
              fireReminder(b, kind, {
                id: `${id}:${now}`,
                blockId: b.id,
                kind,
                title: `Upcoming: ${b.subject}`,
                body: `${b.topic} starts in ${minsUntil} min (${b.startTime})`,
                at: now,
                read: false,
              });
            }
          } else {
            const minsUntil = Math.round((start - now) / 60000);
            if (minsUntil <= 0 && minsUntil > -2) {
              fireReminder(b, kind, {
                id: `${id}:${now}`,
                blockId: b.id,
                kind,
                title: `Time to focus: ${b.subject}`,
                body: `${b.topic} · ${b.startTime}–${b.endTime}`,
                at: now,
                read: false,
              });
            }
          }
        }
      }

      if (newOnes.length) {
        setReminders((prev) => [...prev, ...newOnes]);
        persistFired();
      }
    };

    tick();
    const iv = setInterval(tick, 30000);
    return () => clearInterval(iv);
  }, [data.schedule, hydrated, snooze]);

  const unread = reminders.filter((r) => !r.read).length;
  const markAllRead = () => setReminders((prev) => prev.map((r) => ({ ...r, read: true })));
  const clear = () => setReminders([]);

  return {
    reminders: [...reminders].reverse(),
    unread,
    markAllRead,
    clear,
    snooze,
    snoozeOptions: SNOOZE_OPTIONS,
    Bell,
  };
}
