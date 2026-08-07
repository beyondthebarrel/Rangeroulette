const STORAGE_KEY = "range-roulette-leaderboard-v1";

/** Minimum completed matches before a player qualifies for the Best Win % ranking. */
export const MIN_MATCHES_FOR_WIN_PCT = 3;

export interface LeaderboardEntry {
  name: string;
  wins: number;
  losses: number;
}

export interface LeaderboardStats extends LeaderboardEntry {
  matchesPlayed: number;
  winPct: number;
}

interface LeaderboardData {
  entries: Record<string, LeaderboardEntry>;
  recordedMatchIds: string[];
}

function emptyData(): LeaderboardData {
  return { entries: {}, recordedMatchIds: [] };
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function load(): LeaderboardData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw) as Partial<LeaderboardData>;
    return {
      entries: parsed.entries ?? {},
      recordedMatchIds: parsed.recordedMatchIds ?? [],
    };
  } catch {
    return emptyData();
  }
}

function save(data: LeaderboardData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Records the outcome of a completed match. Safe to call more than once for the same matchId — later calls are no-ops. */
export function recordMatchResult(
  matchId: string,
  playerNames: string[],
  winnerName: string,
) {
  const data = load();
  if (data.recordedMatchIds.includes(matchId)) return;

  const winnerKey = normalizeName(winnerName);
  playerNames.forEach((name) => {
    const key = normalizeName(name);
    const existing = data.entries[key] ?? { name, wins: 0, losses: 0 };
    const won = key === winnerKey;
    data.entries[key] = {
      name,
      wins: existing.wins + (won ? 1 : 0),
      losses: existing.losses + (won ? 0 : 1),
    };
  });

  data.recordedMatchIds.push(matchId);
  save(data);
}

export function getLeaderboardStats() {
  const data = load();
  const all: LeaderboardStats[] = Object.values(data.entries).map((e) => {
    const matchesPlayed = e.wins + e.losses;
    return {
      ...e,
      matchesPlayed,
      winPct: matchesPlayed > 0 ? e.wins / matchesPlayed : 0,
    };
  });

  const mostWins = [...all].sort(
    (a, b) => b.wins - a.wins || b.winPct - a.winPct || a.name.localeCompare(b.name),
  );

  const eligible = all.filter((e) => e.matchesPlayed >= MIN_MATCHES_FOR_WIN_PCT);
  const bestWinPct = [...eligible].sort(
    (a, b) => b.winPct - a.winPct || b.wins - a.wins || a.name.localeCompare(b.name),
  );

  const notYetQualified = all
    .filter((e) => e.matchesPlayed < MIN_MATCHES_FOR_WIN_PCT)
    .sort((a, b) => a.name.localeCompare(b.name));

  return { mostWins, bestWinPct, notYetQualified };
}
