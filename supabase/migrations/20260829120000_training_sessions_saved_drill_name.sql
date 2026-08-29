-- Denormalized snapshot of the saved drill's name (if any) a session was
-- logged against, so History can show it even after the saved drill is
-- later renamed or deleted. Mirrors how `drill` already snapshots the cards
-- rather than referencing saved_drills by id.
ALTER TABLE public.training_sessions
  ADD COLUMN saved_drill_name TEXT;
