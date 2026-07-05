ALTER TABLE public.threads ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS threads_user_archived_idx ON public.threads(user_id, archived);