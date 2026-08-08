-- Shared updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Shared match leaderboard (Game Mode is pass-and-play, so entries are keyed by
-- player display name rather than by account; any signed-in user can record a
-- completed match and everyone signed in can see the shared standings).
CREATE TABLE public.match_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  player_name_normalized TEXT NOT NULL,
  won BOOLEAN NOT NULL,
  recorded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (match_id, player_name_normalized)
);

CREATE INDEX idx_match_results_player ON public.match_results(player_name_normalized);

GRANT SELECT, INSERT ON public.match_results TO authenticated;
GRANT ALL ON public.match_results TO service_role;

ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can view the shared leaderboard"
  ON public.match_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Signed-in users can record match results"
  ON public.match_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = recorded_by);

-- Training Mode sessions, private to the account that logged them (syncs
-- across that account's devices, not shared with other users).
CREATE TABLE public.training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recorded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainee TEXT NOT NULL,
  trainee_normalized TEXT NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  drill JSONB NOT NULL,
  raw_seconds NUMERIC NOT NULL,
  zone_misses INTEGER NOT NULL DEFAULT 0,
  complete_misses INTEGER NOT NULL DEFAULT 0,
  final_seconds NUMERIC NOT NULL
);

CREATE INDEX idx_training_sessions_owner ON public.training_sessions(recorded_by);
CREATE INDEX idx_training_sessions_trainee ON public.training_sessions(recorded_by, trainee_normalized);

GRANT SELECT, INSERT ON public.training_sessions TO authenticated;
GRANT ALL ON public.training_sessions TO service_role;

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own training sessions"
  ON public.training_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = recorded_by);

CREATE POLICY "Users can log their own training sessions"
  ON public.training_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = recorded_by);
