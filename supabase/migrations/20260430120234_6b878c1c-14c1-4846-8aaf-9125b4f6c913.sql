ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS exam_date date,
  ADD COLUMN IF NOT EXISTS is_weak boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_hours numeric NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS preferred_start text NOT NULL DEFAULT '09:00';