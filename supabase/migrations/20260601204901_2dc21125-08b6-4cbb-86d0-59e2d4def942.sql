ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS clarity_score smallint NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS clarity_trend text NOT NULL DEFAULT 'same';

ALTER TABLE public.challenges
  DROP CONSTRAINT IF EXISTS challenges_clarity_trend_check;
ALTER TABLE public.challenges
  ADD CONSTRAINT challenges_clarity_trend_check CHECK (clarity_trend IN ('up','same','down'));