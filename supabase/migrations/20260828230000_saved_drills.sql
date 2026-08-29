-- Saved training drills (private per user): lets a Train Mode user save a
-- drawn 5-card drill under a name and re-load it later instead of drawing
-- randomly. Mirrors the ownership pattern used by training_sessions.
CREATE TABLE public.saved_drills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL,
  drill JSONB NOT NULL,
  par_seconds NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, name_normalized)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_drills TO authenticated;
GRANT ALL ON public.saved_drills TO service_role;

ALTER TABLE public.saved_drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved drills"
  ON public.saved_drills FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved drills"
  ON public.saved_drills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved drills"
  ON public.saved_drills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved drills"
  ON public.saved_drills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
