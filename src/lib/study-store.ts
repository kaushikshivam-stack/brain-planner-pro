// Simple localStorage-backed store for the study planner.
import { useEffect, useState } from "react";

export type ScheduleBlock = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
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
  color: string; // chart token name e.g. "chart-1"
};

export type StudySession = {
  id: string;
  subjectId?: string;
  minutes: number;
  date: string; // YYYY-MM-DD
};

export type StudyData = {
  subjects: Subject[];
  schedule: ScheduleBlock[];
  sessions: StudySession[];
};

const KEY = "noesis.study.v1";

const defaultData = (): StudyData => {
  const today = new Date().toISOString().slice(0, 10);
  const subjects: Subject[] = [
    { id: "s1", name: "Mathematics", goalHours: 40, completedHours: 28, color: "chart-1" },
    { id: "s2", name: "Physics", goalHours: 35, completedHours: 31, color: "chart-2" },
    { id: "s3", name: "Chemistry", goalHours: 30, completedHours: 12, color: "chart-3" },
    { id: "s4", name: "English", goalHours: 20, completedHours: 16, color: "chart-4" },
  ];
  const schedule: ScheduleBlock[] = [
    { id: "b1", date: today, startTime: "09:00", endTime: "10:30", subject: "Mathematics", topic: "Calculus — Integration practice", done: true },
    { id: "b2", date: today, startTime: "11:00", endTime: "12:30", subject: "Physics", topic: "Rotational dynamics", done: false },
    { id: "b3", date: today, startTime: "14:00", endTime: "15:30", subject: "Chemistry", topic: "Organic — Reaction mechanisms", done: false },
    { id: "b4", date: today, startTime: "17:00", endTime: "18:00", subject: "English", topic: "Comprehension drill", done: false },
  ];
  const sessions: StudySession[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      id: `init-${i}`,
      minutes: [120, 180, 90, 240, 60, 200, 150][i],
      date: d.toISOString().slice(0, 10),
    };
  });
  return { subjects, schedule, sessions };
};

export function loadData(): StudyData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const d = defaultData();
      localStorage.setItem(KEY, JSON.stringify(d));
      return d;
    }
    return JSON.parse(raw) as StudyData;
  } catch {
    return defaultData();
  }
}

export function saveData(d: StudyData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(d));
}

export function useStudyData() {
  const [data, setData] = useState<StudyData>(() => defaultData());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(loadData());
    setHydrated(true);
  }, []);

  const update = (mut: (d: StudyData) => StudyData) => {
    setData((prev) => {
      const next = mut(prev);
      saveData(next);
      return next;
    });
  };

  return { data, setData: update, hydrated };
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
