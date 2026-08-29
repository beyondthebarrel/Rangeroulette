import { useEffect, useState } from "react";
import {
  getTraineeNames,
  getTraineeStats,
  getTrainingSessions,
  type TraineeStats,
} from "../training/storage";
import type { TrainingDrill, TrainingSession } from "../training/types";
import { HeroBackdrop } from "./HeroBackdrop";
import { Panel } from "./Panel";
import { TitleFrame } from "./TitleFrame";

function drillSummary(drill: TrainingDrill): string {
  const parts = [drill.time, drill.distance, drill.startPosition, drill.target, drill.courseOfFire];
  return parts.map((c) => c.label).join(" · ");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TrainHistoryScreen({ onBack }: { onBack: () => void }) {
  const [names, setNames] = useState<string[] | null>(null);
  const [selected, setSelected] = useState("");
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [stats, setStats] = useState<TraineeStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTraineeNames().then((loaded) => {
      if (cancelled) return;
      setNames(loaded);
      setSelected(loaded[0] ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selected) {
      setSessions([]);
      setStats(null);
      return;
    }
    let cancelled = false;
    getTrainingSessions(selected).then((loaded) => {
      if (!cancelled) setSessions(loaded);
    });
    getTraineeStats(selected).then((loaded) => {
      if (!cancelled) setStats(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  return (
    <HeroBackdrop>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <TitleFrame>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-red-500">
            Training History
          </h1>

          {names === null ? (
            <p className="text-center text-sm text-zinc-400">Loading…</p>
          ) : names.length === 0 ? (
            <p className="text-center text-sm text-zinc-400">
              No sessions logged yet. Run a drill in Train Mode to start tracking.
            </p>
          ) : (
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-red-600 focus:outline-none"
            >
              {names.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
        </TitleFrame>

        {stats && (
          <Panel>
            <div className="text-sm font-semibold text-zinc-300">Personal Bests</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {stats.bestSession.finalSeconds.toFixed(2)}s
                </div>
                <div className="text-xs text-zinc-500">Best time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.averageSeconds.toFixed(2)}s
                </div>
                <div className="text-xs text-zinc-500">Average</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.sessionCount}</div>
                <div className="text-xs text-zinc-500">Sessions</div>
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              Best run:{" "}
              {stats.bestSession.savedDrillName && (
                <span className="text-red-400">{stats.bestSession.savedDrillName} · </span>
              )}
              {drillSummary(stats.bestSession.drill)}
            </div>
          </Panel>
        )}

        {sessions.length > 0 && (
          <Panel>
            <div className="text-sm font-semibold text-zinc-300">Session History</div>
            <ul className="flex flex-col gap-2">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-red-900/40 bg-zinc-900/60 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg text-white">
                      {s.finalSeconds.toFixed(2)}s
                    </span>
                    <span className="text-xs text-zinc-500">{formatDate(s.loggedAt)}</span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    {s.savedDrillName && (
                      <span className="text-red-400">{s.savedDrillName} · </span>
                    )}
                    {drillSummary(s.drill)}
                  </div>
                  {(s.zoneMisses > 0 || s.completeMisses > 0) && (
                    <div className="text-xs text-amber-400">
                      {s.zoneMisses > 0 && `${s.zoneMisses} zone miss${s.zoneMisses > 1 ? "es" : ""}`}
                      {s.zoneMisses > 0 && s.completeMisses > 0 && ", "}
                      {s.completeMisses > 0 &&
                        `${s.completeMisses} complete miss${s.completeMisses > 1 ? "es" : ""}`}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <button
          onClick={onBack}
          className="w-full rounded-md bg-red-700 px-4 py-2.5 font-semibold uppercase tracking-wide text-white hover:bg-red-600"
        >
          Back
        </button>
      </div>
    </HeroBackdrop>
  );
}
