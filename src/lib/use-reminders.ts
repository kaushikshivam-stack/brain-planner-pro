// In-app reminder engine. Watches today's schedule blocks and fires
// toast notifications + tracks unread reminders for the bell.
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { todayStr, useStudyData, type ScheduleBlock } from "@/lib/study-store";

export type Reminder = {
  id: string;
  blockId: string;
  title: string;
  body: string;
  at: number;
  read: boolean;
  kind: "upcoming" | "starting";
};

const STORAGE_KEY = "noesis.reminders.v1";
const FIRED_KEY = "noesis.reminders.fired.v1";
const LEAD_MINUTES = 10;

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

export function useReminders() {
  const { data, hydrated } = useStudyData();
  const [reminders, setReminders] = useState<Reminder[]>(() => loadList<Reminder>(STORAGE_KEY));
  const firedRef = useRef<Set<string>>(new Set(loadList<string>(FIRED_KEY)));

  // Persist reminder list
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders.slice(-50)));
    }
  }, [reminders]);

  useEffect(() => {
    if (!hydrated) return;
    const today = todayStr();

    const tick = () => {
      const now = Date.now();
      const todayBlocks = data.schedule.filter((b) => b.date === today && !b.done);

      const newOnes: Reminder[] = [];
      for (const b of todayBlocks) {
        const start = blockStartMs(b);
        const minsUntil = Math.round((start - now) / 60000);

        // Heads-up reminder
        if (minsUntil <= LEAD_MINUTES && minsUntil > 0) {
          const id = `${b.id}:upcoming`;
          if (!firedRef.current.has(id)) {
            firedRef.current.add(id);
            const r: Reminder = {
              id,
              blockId: b.id,
              kind: "upcoming",
              title: `Upcoming: ${b.subject}`,
              body: `${b.topic} starts in ${minsUntil} min (${b.startTime})`,
              at: now,
              read: false,
            };
            newOnes.push(r);
            toast(r.title, { description: r.body, icon: "⏳" });
          }
        }

        // Starting now
        if (minsUntil <= 0 && minsUntil > -2) {
          const id = `${b.id}:starting`;
          if (!firedRef.current.has(id)) {
            firedRef.current.add(id);
            const r: Reminder = {
              id,
              blockId: b.id,
              kind: "starting",
              title: `Time to focus: ${b.subject}`,
              body: `${b.topic} · ${b.startTime}–${b.endTime}`,
              at: now,
              read: false,
            };
            newOnes.push(r);
            toast.success(r.title, { description: r.body });
          }
        }
      }

      if (newOnes.length) {
        setReminders((prev) => [...prev, ...newOnes]);
        if (typeof window !== "undefined") {
          localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(firedRef.current)));
        }
      }
    };

    tick();
    const iv = setInterval(tick, 30000);
    return () => clearInterval(iv);
  }, [data.schedule, hydrated]);

  const unread = reminders.filter((r) => !r.read).length;
  const markAllRead = () => setReminders((prev) => prev.map((r) => ({ ...r, read: true })));
  const clear = () => setReminders([]);

  return { reminders: [...reminders].reverse(), unread, markAllRead, clear, Bell };
}
