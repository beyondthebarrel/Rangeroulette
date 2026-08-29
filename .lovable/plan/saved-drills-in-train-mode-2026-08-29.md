# Saved Drills in Train Mode

Let users save a drawn drill under a name, then re-load any saved drill later to log times and penalties against it.

## What the user gets

- A **Save Drill** button next to "New Drill". It asks for a short name and stores the current 5-card draw.
- A **Saved Drills** picker above the drill panel. Choosing one loads those exact cards into the drill area (instead of a random draw), so times, zone misses, and complete misses are logged against it exactly as today.
- A small "Random draw" option to return to normal random drills, plus the ability to delete a saved drill.
- Saved drills are private: each signed-in user only sees their own.
- Logging a result works unchanged and still appears in History & Personal Bests.

## Technical notes

**Database** — new `saved_drills` table:
- `id`, `user_id`, `name`, `drill` (jsonb snapshot in the existing `TrainingDrill` shape), `par_seconds`, `created_at`
- Grants for `authenticated` and `service_role`; RLS enabled with select/insert/update/delete policies scoped to `auth.uid() = user_id`
- Unique on (`user_id`, lowercased `name`) so re-saving the same name updates rather than duplicates

**Code**
- `src/integrations/supabase/types.ts`: add the `saved_drills` table types.
- New `src/training/savedDrills.ts`: `listSavedDrills`, `saveDrill`, `deleteSavedDrill` following the patterns in `src/training/storage.ts`.
- `src/training/useTrainingDrill.ts`: add a way to load a fixed drill (`loadDrill(drill)`) alongside `drawNew`, keeping deck state intact when returning to random draws.
- `src/components/TrainScreen.tsx`: saved-drill select, Save/Delete controls, name input for saving; log flow and `computeFinalSeconds` untouched.

No changes to Game/match mode.
