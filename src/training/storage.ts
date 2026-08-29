import { supabase } from "../integrations/supabase/client";
import type { TrainingDrill, TrainingSession } from "./types";

const LAST_NAME_KEY = "range-roulette-training-last-name";

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function fromRow(row: {
  id: string;
  trainee: string;
  logged_at: string;
  drill: unknown;
  raw_seconds: number;
  zone_misses: number;
  complete_misses: number;
  final_seconds: number;
  saved_drill_name: string | null;
}): TrainingSession {
  return {
    id: row.id,
    trainee: row.trainee,
    loggedAt: row.logged_at,
    drill: row.drill as TrainingDrill,
    rawSeconds: row.raw_seconds,
    zoneMisses: row.zone_misses,
    completeMisses: row.complete_misses,
    finalSeconds: row.final_seconds,
    savedDrillName: row.saved_drill_name ?? undefined,
  };
}

export async function recordTrainingSession(
  session: Omit<TrainingSession, "id" | "loggedAt">,
  recordedBy: string,
): Promise<TrainingSession | null> {
  const basePayload = {
    recorded_by: recordedBy,
    trainee: session.trainee,
    trainee_normalized: normalizeName(session.trainee),
    drill: session.drill,
    raw_seconds: session.rawSeconds,
    zone_misses: session.zoneMisses,
    complete_misses: session.completeMisses,
    final_seconds: session.finalSeconds,
  };
  const payload = session.savedDrillName
    ? { ...basePayload, saved_drill_name: session.savedDrillName }
    : basePayload;

  let { data, error } = await supabase
    .from("training_sessions")
    .insert(payload)
    .select()
    .single();

  // If saved_drill_name is set but the column hasn't been migrated onto the
  // live project yet, PostgREST rejects the whole insert (PGRST204). Retry
  // without it so the result still logs — the saved-drill name just won't
  // show in History until the migration runs.
  if (error?.code === "PGRST204" && "saved_drill_name" in payload) {
    ({ data, error } = await supabase
      .from("training_sessions")
      .insert(basePayload)
      .select()
      .single());
  }

  if (error || !data) {
    console.error("Failed to record training session", error);
    return null;
  }
  return fromRow(data);
}

export async function getTrainingSessions(trainee?: string): Promise<TrainingSession[]> {
  let query = supabase
    .from("training_sessions")
    .select("*")
    .order("logged_at", { ascending: false });

  if (trainee) {
    query = query.eq("trainee_normalized", normalizeName(trainee));
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Failed to load training sessions", error);
    return [];
  }
  return data.map(fromRow);
}

export async function deleteTrainingSession(id: string): Promise<boolean> {
  // .select() so we get the deleted row(s) back — without it, Postgres/PostgREST
  // reports success with zero rows affected when RLS blocks the delete (e.g. the
  // grant/policy migration hasn't been applied yet), rather than an error, which
  // would otherwise look like a successful delete that silently did nothing.
  const { data, error } = await supabase
    .from("training_sessions")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    console.error("Failed to delete training session", error);
    return false;
  }
  if (!data || data.length === 0) {
    console.error("Failed to delete training session: no rows affected");
    return false;
  }
  return true;
}

export async function getTraineeNames(): Promise<string[]> {
  const { data, error } = await supabase
    .from("training_sessions")
    .select("trainee, trainee_normalized")
    .order("trainee");

  if (error || !data) {
    console.error("Failed to load trainee names", error);
    return [];
  }
  const seen = new Map<string, string>();
  data.forEach((row) => seen.set(row.trainee_normalized, row.trainee));
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

export interface TraineeStats {
  trainee: string;
  sessionCount: number;
  bestSession: TrainingSession;
  averageSeconds: number;
}

export async function getTraineeStats(trainee: string): Promise<TraineeStats | null> {
  const sessions = await getTrainingSessions(trainee);
  if (sessions.length === 0) return null;
  const bestSession = sessions.reduce((a, b) =>
    a.finalSeconds <= b.finalSeconds ? a : b,
  );
  const averageSeconds =
    Math.round(
      (sessions.reduce((sum, s) => sum + s.finalSeconds, 0) / sessions.length) * 100,
    ) / 100;
  return {
    trainee: sessions[0].trainee,
    sessionCount: sessions.length,
    bestSession,
    averageSeconds,
  };
}

export function getLastTraineeName(): string {
  try {
    return localStorage.getItem(LAST_NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setLastTraineeName(name: string) {
  try {
    localStorage.setItem(LAST_NAME_KEY, name);
  } catch {
    // ignore — non-critical convenience feature
  }
}
