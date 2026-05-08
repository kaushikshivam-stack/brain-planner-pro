
-- User rewards / gamification
CREATE TABLE public.user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  total_sessions integer NOT NULL DEFAULT 0,
  total_minutes integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  weekly_xp integer NOT NULL DEFAULT 0,
  weekly_start date NOT NULL DEFAULT (date_trunc('week', now())::date),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own rewards" ON public.user_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own rewards" ON public.user_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own rewards" ON public.user_rewards FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_user_rewards_updated
BEFORE UPDATE ON public.user_rewards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Achievements unlocked
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_key text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_key)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own achievements" ON public.user_achievements FOR DELETE USING (auth.uid() = user_id);
