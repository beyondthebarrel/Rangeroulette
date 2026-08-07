import type { TrainingSession } from "./types";

const STORAGE_KEY = "range-roulette-training-v1";
const LAST_NAME_KEY = "range-roulette-training-last-name";

interface TrainingData {
  sessions: TrainingSession[];
}

let idCounter = 0;
function nextSessionId(): string {
  idCounter += 1;
  return `train-${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function emptyData(): TrainingData {
  return { sessions: [] };
}

function load(): TrainingData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw) as Partial<TrainingData>;
    return { sessions: parsed.sessions ?? [] };
  } catch {
    return emptyData();
  }
}

function save(data: TrainingData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function recordTrainingSession(
  session: Omit<TrainingSession, "id" | "loggedAt">,
): TrainingSession {
  const data = load();
  const full: TrainingSession = {
    ...session,
    id: nextSessionId(),
    loggedAt: new Date().toISOString(),
  };
  data.sessions.push(full);
  save(data);
  return full;
}

export function getTrainingSessions(trainee?: string): TrainingSession[] {
  const data = load();
  const sessions = trainee
    ? data.sessions.filter((s) => normalizeName(s.trainee) === normalizeName(trainee))
    : data.sessions;
  return [...sessions].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
}

export function getTraineeNames(): string[] {
  const data = load();
  const seen = new Map<string, string>();
  data.sessions.forEach((s) => seen.set(normalizeName(s.trainee), s.trainee));
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

export interface TraineeStats {
  trainee: string;
  sessionCount: number;
  bestSession: TrainingSession;
  averageSeconds: number;
}

export function getTraineeStats(trainee: string): TraineeStats | null {
  const sessions = getTrainingSessions(trainee);
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
