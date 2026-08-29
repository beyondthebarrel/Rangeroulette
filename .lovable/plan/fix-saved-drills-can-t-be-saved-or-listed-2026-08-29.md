# Fix: saved drills can't be saved or listed

## What's happening

Every request to the saved-drills table comes back with:

```text
PGRST205 — Could not find the table 'public.saved_drills' in the schema cache
```

This is confirmed in both the console logs and the network requests: the reads
(`GET /rest/v1/saved_drills`) and the saves (`POST /rest/v1/saved_drills`) return 404,
while `training_sessions` requests on the same connection return 200. So the app code
and your sign-in are fine — the table simply does not exist in your Supabase project.

The app is connected to your own external Supabase account, so I can't run migrations
against it. The SQL is already written and waiting at `db/saved_drills.sql`.

## What you need to do (one step)

1. Open your Supabase dashboard for project `obgfbgggozfbkisozkvr`.
2. Go to SQL Editor, paste the full contents of `db/saved_drills.sql`, and run it.
   It creates the table, grants Data API access to `authenticated` and `service_role`,
   enables row-level security, and adds the four owner-only policies.
3. Reload the app and sign in again.

After that, "Save Drill" will store the current draw and the dropdown will list your
saved drills.

## Then I verify

Once you confirm the SQL ran, I'll check the preview while signed in: save a drill,
reload, and confirm it comes back in the dropdown and that logging a time against it
writes a session row. If anything still fails I'll read the exact error rather than guess.

## Notes on the "log results" part

Logging results writes to `training_sessions`, which is working (those requests return
200 with your existing rows). The Log Result button is disabled unless a trainee name is
filled in and a seconds value is entered, so if it looked dead that's likely the cause —
but if it still fails after the table exists, I'll investigate that path separately with
the live error rather than assume.
