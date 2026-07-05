CREATE TABLE public.message_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  thread_id uuid NOT NULL,
  message_id text NOT NULL,
  rating smallint NOT NULL CHECK (rating IN (-1, 1)),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, message_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_feedback TO authenticated;
GRANT ALL ON public.message_feedback TO service_role;

ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own feedback select" ON public.message_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own feedback insert" ON public.message_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own feedback update" ON public.message_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own feedback delete" ON public.message_feedback FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_message_feedback_user ON public.message_feedback(user_id, created_at DESC);
CREATE INDEX idx_message_feedback_thread ON public.message_feedback(thread_id);