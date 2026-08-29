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
  const { data, error } = await supabase
    .from("training_sessions")
    .insert({
      recorded_by: recordedBy,
      trainee: session.trainee,
      trainee_normalized: normalizeName(session.trainee),
      drill: session.drill,
      raw_seconds: session.rawSeconds,
      zone_misses: session.zoneMisses,
      complete_misses: session.completeMisses,
      final_seconds: session.finalSeconds,
      saved_drill_name: session.savedDrillName ?? null,
    })
    .select()
    .single();

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
