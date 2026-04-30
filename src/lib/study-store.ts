// Cloud-backed study data sync. Replaces localStorage when user is signed in.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type ScheduleBlock = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  subject: string;
  topic: string;
  done: boolean;
};

export type Subject = {
  id: string;
  name: string;
  goalHours: number;
  completedHours: number;
  color: string;
};

export type StudySession = {
  id: string;
  subjectId?: string | null;
  minutes: number;
  date: string;
};

export type StudyData = {
  subjects: Subject[];
  schedule: ScheduleBlock[];
  sessions: StudySession[];
};

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const COLORS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];

const SEED_SUBJECTS = [
  { name: "Mathematics", goal_hours: 40, completed_hours: 0, color: "chart-1" },
  { name: "Physics", goal_hours: 35, completed_hours: 0, color: "chart-2" },
  { name: "Chemistry", goal_hours: 30, completed_hours: 0, color: "chart-3" },
];

export function useStudyData() {
  const { user } = useAuth();
  const [data, setData] = useState<StudyData>({ subjects: [], schedule: [], sessions: [] });
  const [hydrated, setHydrated] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setData({ subjects: [], schedule: [], sessions: [] });
      setHydrated(true);
      return;
    }
    const [subRes, schedRes, sessRes] = await Promise.all([
      supabase.from("subjects").select("*").order("created_at"),
      supabase.from("schedule_blocks").select("*").order("start_time"),
      supabase.from("study_sessions").select("*").order("date"),
    ]);

    // Seed subjects on first load if empty
    if (subRes.data && subRes.data.length === 0) {
      await supabase.from("subjects").insert(
        SEED_SUBJECTS.map((s) => ({ ...s, user_id: user.id })),
      );
      const reseed = await supabase.from("subjects").select("*").order("created_at");
      subRes.data = reseed.data ?? [];
    }

    setData({
      subjects: (subRes.data ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        goalHours: Number(r.goal_hours),
        completedHours: Number(r.completed_hours),
        color: r.color,
      })),
      schedule: (schedRes.data ?? []).map((r) => ({
        id: r.id,
        date: r.date,
        startTime: r.start_time,
        endTime: r.end_time,
        subject: r.subject,
        topic: r.topic,
        done: r.done,
      })),
      sessions: (sessRes.data ?? []).map((r) => ({
        id: r.id,
        subjectId: r.subject_id,
        minutes: r.minutes,
        date: r.date,
      })),
    });
    setHydrated(true);
  }, [user]);

  useEffect(() => {
    setHydrated(false);
    reload();
  }, [reload]);

  // Mutations
  const addSubject = async (name: string, goalHours: number) => {
    if (!user) return;
    const color = COLORS[data.subjects.length % COLORS.length];
    await supabase.from("subjects").insert({
      user_id: user.id,
      name,
      goal_hours: goalHours,
      completed_hours: 0,
      color,
    });
    reload();
  };

  const removeSubject = async (id: string) => {
    await supabase.from("subjects").delete().eq("id", id);
    reload();
  };

  const addBlock = async (block: Omit<ScheduleBlock, "id" | "done">) => {
    if (!user) return;
    await supabase.from("schedule_blocks").insert({
      user_id: user.id,
      date: block.date,
      start_time: block.startTime,
      end_time: block.endTime,
      subject: block.subject,
      topic: block.topic,
      done: false,
    });
    reload();
  };

  const toggleBlock = async (id: string, done: boolean) => {
    await supabase.from("schedule_blocks").update({ done }).eq("id", id);
    setData((d) => ({
      ...d,
      schedule: d.schedule.map((b) => (b.id === id ? { ...b, done } : b)),
    }));
  };

  const logSession = async (minutes: number) => {
    if (!user) return;
    await supabase.from("study_sessions").insert({
      user_id: user.id,
      minutes,
      date: todayStr(),
    });
    reload();
  };

  return {
    data,
    hydrated,
    reload,
    addSubject,
    removeSubject,
    addBlock,
    toggleBlock,
    logSession,
  };
}
