-- Lets a user delete their own logged training sessions (e.g. to remove a
-- mis-entered result), matching the owner-only delete policy already used
-- for saved_drills.
GRANT DELETE ON public.training_sessions TO authenticated;

CREATE POLICY "Users can delete their own training sessions"
  ON public.training_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = recorded_by);
