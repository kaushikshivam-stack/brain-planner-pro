import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type Rewards = {
  xp: number;
  level: number;
  totalSessions: number;
  totalMinutes: number;
  longestStreak: number;
  weeklyXp: number;
  weeklyStart: string;
};

export type Achievement = {
  key: string;
  name: string;
  desc: string;
  icon: string; // lucide name
  check: (r: Rewards, ctx: { streak: number }) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  { key: "first_session", name: "Initiated", desc: "Complete your first focus session", icon: "Sparkles", check: (r) => r.totalSessions >= 1 },
  { key: "focus_10", name: "Apprentice", desc: "Complete 10 focus sessions", icon: "Target", check: (r) => r.totalSessions >= 10 },
  { key: "focus_50", name: "Focused Mind", desc: "Complete 50 focus sessions", icon: "Brain", check: (r) => r.totalSessions >= 50 },
  { key: "focus_100", name: "Centurion", desc: "Complete 100 focus sessions", icon: "Crown", check: (r) => r.totalSessions >= 100 },
  { key: "hours_10", name: "Deep Diver", desc: "10 hours of total focus", icon: "Clock", check: (r) => r.totalMinutes >= 600 },
  { key: "hours_50", name: "Time Bender", desc: "50 hours of total focus", icon: "Hourglass", check: (r) => r.totalMinutes >= 3000 },
  { key: "streak_3", name: "Spark", desc: "3-day streak", icon: "Flame", check: (_, c) => c.streak >= 3 },
  { key: "streak_7", name: "Inferno", desc: "7-day streak", icon: "Flame", check: (_, c) => c.streak >= 7 },
  { key: "streak_30", name: "Legendary", desc: "30-day streak", icon: "Trophy", check: (_, c) => c.streak >= 30 },
  { key: "level_5", name: "Ascendant", desc: "Reach Level 5", icon: "Zap", check: (r) => r.level >= 5 },
  { key: "level_10", name: "Transcendent", desc: "Reach Level 10", icon: "Star", check: (r) => r.level >= 10 },
  { key: "weekly_warrior", name: "Weekly Warrior", desc: "Earn 500 XP in one week", icon: "Award", check: (r) => r.weeklyXp >= 500 },
];

export const RANKS = [
  { min: 1, name: "Novice", color: "text-muted-foreground" },
  { min: 3, name: "Initiate", color: "text-chart-2" },
  { min: 5, name: "Adept", color: "text-accent" },
  { min: 8, name: "Scholar", color: "text-chart-3" },
  { min: 12, name: "Sage", color: "text-warning" },
  { min: 18, name: "Master", color: "text-primary" },
  { min: 25, name: "Grandmaster", color: "text-chart-4" },
];

export const WEEKLY_GOAL = 500; // XP

export function xpForLevel(level: number) {
  // Total XP needed to reach `level`: 100 * (level-1)^2
  return 100 * Math.pow(level - 1, 2);
}
export function levelFromXp(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}
export function rankFor(level: number) {
  let r = RANKS[0];
  for (const x of RANKS) if (level >= x.min) r = x;
  return r;
}

// Simple event bus for popup
type RewardEvent =
  | { type: "xp"; amount: number }
  | { type: "levelup"; level: number }
  | { type: "achievement"; key: string; name: string; desc: string; icon: string };

const listeners = new Set<(e: RewardEvent) => void>();
export function emitReward(e: RewardEvent) {
  listeners.forEach((l) => l(e));
}
export function onReward(l: (e: RewardEvent) => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function weekStart(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday-based
  x.setDate(x.getDate() - day);
  return x.toISOString().slice(0, 10);
}

export function useRewards() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setRewards(null);
      setUnlocked(new Set());
      setLoaded(true);
      return;
    }
    const [rRes, aRes] = await Promise.all([
      supabase.from("user_rewards").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_achievements").select("achievement_key").eq("user_id", user.id),
    ]);
    let row = rRes.data;
    if (!row) {
      const ins = await supabase
        .from("user_rewards")
        .insert({ user_id: user.id, weekly_start: weekStart() })
        .select("*")
        .single();
      row = ins.data;
    }
    if (row) {
      // Reset weekly XP if a new week
      const ws = weekStart();
      if (row.weekly_start !== ws) {
        const upd = await supabase
          .from("user_rewards")
          .update({ weekly_xp: 0, weekly_start: ws })
          .eq("user_id", user.id)
          .select("*")
          .single();
        row = upd.data ?? row;
      }
      setRewards({
        xp: row.xp,
        level: row.level,
        totalSessions: row.total_sessions,
        totalMinutes: row.total_minutes,
        longestStreak: row.longest_streak,
        weeklyXp: row.weekly_xp,
        weeklyStart: row.weekly_start,
      });
    }
    setUnlocked(new Set((aRes.data ?? []).map((x) => x.achievement_key)));
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const award = useCallback(
    async (minutes: number, currentStreak: number) => {
      if (!user || !rewards) return;
      const xpGain = minutes * 10;
      const newXp = rewards.xp + xpGain;
      const newLevel = levelFromXp(newXp);
      const newWeekly = rewards.weeklyXp + xpGain;
      const newSessions = rewards.totalSessions + 1;
      const newMinutes = rewards.totalMinutes + minutes;
      const newLongest = Math.max(rewards.longestStreak, currentStreak);

      await supabase
        .from("user_rewards")
        .update({
          xp: newXp,
          level: newLevel,
          total_sessions: newSessions,
          total_minutes: newMinutes,
          longest_streak: newLongest,
          weekly_xp: newWeekly,
        })
        .eq("user_id", user.id);

      const next: Rewards = {
        ...rewards,
        xp: newXp,
        level: newLevel,
        totalSessions: newSessions,
        totalMinutes: newMinutes,
        longestStreak: newLongest,
        weeklyXp: newWeekly,
      };
      setRewards(next);

      emitReward({ type: "xp", amount: xpGain });
      if (newLevel > rewards.level) emitReward({ type: "levelup", level: newLevel });

      // Check achievements
      const newlyUnlocked: typeof ACHIEVEMENTS = [];
      for (const a of ACHIEVEMENTS) {
        if (!unlocked.has(a.key) && a.check(next, { streak: currentStreak })) {
          newlyUnlocked.push(a);
        }
      }
      if (newlyUnlocked.length > 0) {
        await supabase.from("user_achievements").insert(
          newlyUnlocked.map((a) => ({ user_id: user.id, achievement_key: a.key })),
        );
        setUnlocked((prev) => {
          const n = new Set(prev);
          newlyUnlocked.forEach((a) => n.add(a.key));
          return n;
        });
        newlyUnlocked.forEach((a) =>
          emitReward({ type: "achievement", key: a.key, name: a.name, desc: a.desc, icon: a.icon }),
        );
      }
    },
    [user, rewards, unlocked],
  );

  return { rewards, unlocked, loaded, award, reload };
}
