
-- Extend threads table
ALTER TABLE public.threads
  ADD COLUMN IF NOT EXISTS coach_id text NOT NULL DEFAULT 'executive',
  ADD COLUMN IF NOT EXISTS challenge_id uuid,
  ADD COLUMN IF NOT EXISTS phase text NOT NULL DEFAULT 'diagnosis';

-- Extend challenges
ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS diagnosis jsonb,
  ADD COLUMN IF NOT EXISTS urgency text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS impact text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS root_causes jsonb,
  ADD COLUMN IF NOT EXISTS secondary_challenges jsonb,
  ADD COLUMN IF NOT EXISTS executive_summary text,
  ADD COLUMN IF NOT EXISTS phase text NOT NULL DEFAULT 'diagnosis';

-- Action plans
CREATE TABLE IF NOT EXISTS public.action_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid,
  title text NOT NULL,
  horizon text NOT NULL DEFAULT '30',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.action_plans TO authenticated;
GRANT ALL ON public.action_plans TO service_role;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own action_plans" ON public.action_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.action_plans(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  horizon text NOT NULL DEFAULT '30',
  due_date date,
  owner text,
  status text NOT NULL DEFAULT 'todo',
  priority int NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.action_items TO authenticated;
GRANT ALL ON public.action_items TO service_role;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own action_items" ON public.action_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- OKRs
CREATE TABLE IF NOT EXISTS public.okrs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid,
  objective text NOT NULL,
  quarter text,
  progress int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.okrs TO authenticated;
GRANT ALL ON public.okrs TO service_role;
ALTER TABLE public.okrs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own okrs" ON public.okrs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.key_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  okr_id uuid NOT NULL REFERENCES public.okrs(id) ON DELETE CASCADE,
  name text NOT NULL,
  target numeric NOT NULL DEFAULT 100,
  current numeric NOT NULL DEFAULT 0,
  unit text DEFAULT '%',
  last_check_in timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.key_results TO authenticated;
GRANT ALL ON public.key_results TO service_role;
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own key_results" ON public.key_results FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Weekly reviews
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start date NOT NULL DEFAULT current_date,
  score int NOT NULL DEFAULT 0,
  wins jsonb DEFAULT '[]'::jsonb,
  blockers jsonb DEFAULT '[]'::jsonb,
  next_priorities jsonb DEFAULT '[]'::jsonb,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_reviews TO authenticated;
GRANT ALL ON public.weekly_reviews TO service_role;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own weekly_reviews" ON public.weekly_reviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Decisions
CREATE TABLE IF NOT EXISTS public.decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid,
  title text NOT NULL,
  context text,
  options jsonb DEFAULT '[]'::jsonb,
  criteria jsonb DEFAULT '[]'::jsonb,
  recommendation text,
  chosen_option text,
  outcome text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decisions TO authenticated;
GRANT ALL ON public.decisions TO service_role;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own decisions" ON public.decisions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Risks
CREATE TABLE IF NOT EXISTS public.risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid,
  title text NOT NULL,
  description text,
  likelihood text NOT NULL DEFAULT 'medium',
  impact text NOT NULL DEFAULT 'medium',
  mitigation text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.risks TO authenticated;
GRANT ALL ON public.risks TO service_role;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own risks" ON public.risks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Board sessions
CREATE TABLE IF NOT EXISTS public.board_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid,
  topic text NOT NULL,
  perspectives jsonb DEFAULT '[]'::jsonb,
  consensus text,
  top_recommendation text,
  major_risks jsonb DEFAULT '[]'::jsonb,
  immediate_actions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.board_sessions TO authenticated;
GRANT ALL ON public.board_sessions TO service_role;
ALTER TABLE public.board_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own board_sessions" ON public.board_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Accountability check-ins
CREATE TABLE IF NOT EXISTS public.accountability_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_item_id uuid,
  note text,
  status text NOT NULL DEFAULT 'on_track',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accountability_checkins TO authenticated;
GRANT ALL ON public.accountability_checkins TO service_role;
ALTER TABLE public.accountability_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own accountability_checkins" ON public.accountability_checkins FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DO $$ BEGIN
  CREATE TRIGGER tr_action_plans_upd BEFORE UPDATE ON public.action_plans FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER tr_action_items_upd BEFORE UPDATE ON public.action_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER tr_okrs_upd BEFORE UPDATE ON public.okrs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER tr_key_results_upd BEFORE UPDATE ON public.key_results FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER tr_decisions_upd BEFORE UPDATE ON public.decisions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER tr_risks_upd BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
