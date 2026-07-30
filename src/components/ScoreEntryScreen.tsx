import { useState } from "react";
import { CATEGORY_ORDER } from "../data/cards";
import { useGame } from "../game/GameContext";
import type { ScoreEntry } from "../game/types";
import { Panel } from "./Panel";
import { PlayingCard } from "./PlayingCard";
import { Stopwatch } from "./Stopwatch";

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="h-7 w-7 rounded bg-zinc-700 text-white hover:bg-zinc-600"
        >
          −
        </button>
        <span className="w-5 text-center font-mono text-white">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="h-7 w-7 rounded bg-zinc-700 text-white hover:bg-zinc-600"
        >
          +
        </button>
      </div>
    </div>
  );
}

function PlayerScoreCard({
  playerId,
  name,
  entry,
  onChange,
}: {
  playerId: string;
  name: string;
  entry: ScoreEntry;
  onChange: (entry: ScoreEntry) => void;
}) {
  const [mode, setMode] = useState<"idle" | "timer" | "manual">("idle");
  const [manualValue, setManualValue] = useState("");

  return (
    <div className="rounded-lg border border-red-900/40 bg-zinc-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <input
            type="checkbox"
            checked={entry.dnf}
            onChange={(e) => onChange({ ...entry, dnf: e.target.checked })}
          />
          DNF
        </label>
      </div>

      {!entry.dnf && (
        <>
          <div className="mb-3 flex items-center gap-3">
            <div className="font-mono text-2xl text-white">
              {entry.rawSeconds != null ? `${entry.rawSeconds.toFixed(2)}s` : "—"}
            </div>
            <button
              onClick={() => setMode(mode === "timer" ? "idle" : "timer")}
              className="rounded bg-sky-700 px-3 py-1 text-sm text-white hover:bg-sky-600"
            >
              {mode === "timer" ? "Close Timer" : "Time It"}
            </button>
            <button
              onClick={() => setMode(mode === "manual" ? "idle" : "manual")}
              className="rounded bg-zinc-700 px-3 py-1 text-sm text-white hover:bg-zinc-600"
            >
              {mode === "manual" ? "Cancel" : "Enter Manually"}
            </button>
          </div>

          {mode === "timer" && (
            <div className="mb-3">
              <Stopwatch
                onCapture={(s) => {
                  onChange({ ...entry, rawSeconds: s });
                  setMode("idle");
                }}
              />
            </div>
          )}

          {mode === "manual" && (
            <div className="mb-3 flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                placeholder="seconds"
                className="w-28 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-white"
              />
              <button
                onClick={() => {
                  const n = parseFloat(manualValue);
                  if (!Number.isNaN(n)) {
                    onChange({ ...entry, rawSeconds: n });
                    setMode("idle");
                    setManualValue("");
                  }
                }}
                className="rounded bg-red-700 px-3 py-1 text-sm text-white hover:bg-red-600"
              >
                Set
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Stepper
              label="Zone misses (+0.5s)"
              value={entry.zoneMisses}
              onChange={(v) => onChange({ ...entry, zoneMisses: v })}
            />
            <Stepper
              label="Complete misses (+1.0s)"
              value={entry.completeMisses}
              onChange={(v) => onChange({ ...entry, completeMisses: v })}
            />
          </div>
        </>
      )}
      <div className="hidden">{playerId}</div>
    </div>
  );
}

export function ScoreEntryScreen({
  title,
  parSeconds,
  onSubmit,
  submitLabel,
}: {
  title: string;
  parSeconds?: number;
  onSubmit: () => void;
  submitLabel: string;
}) {
  const { state, dispatch } = useGame();

  const allEntered = state.players.every((p) => {
    const e = state.scores[p.id];
    return e && (e.dnf || e.rawSeconds != null);
  });

  const drill = state.currentDrill;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      {drill && (
        <Panel>
          <div className="text-sm font-semibold text-zinc-300">
            The Drill (for reference — run it now)
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {CATEGORY_ORDER.map((cat) => {
              const card = drill.cards[cat];
              if (!card) return null;
              return (
                <PlayingCard
                  key={card.instanceId}
                  cardId={card.def.id}
                  overlay={
                    card.def.dealersChoice ? (
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1.5 text-center text-xs text-white">
                        {drill.dealersChoiceValues[cat]}
                      </div>
                    ) : undefined
                  }
                />
              );
            })}
          </div>
          {drill.activeChallenges.length > 0 && (
            <ul className="flex flex-col gap-1">
              {drill.activeChallenges.map((c) => {
                const target = state.players.find((p) => p.id === c.targetPlayerId);
                return (
                  <li key={c.instance.instanceId} className="text-sm text-zinc-200">
                    <span className="text-white">{target?.name}</span>: {c.instance.def.text}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      )}
      <Panel>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {parSeconds != null && (
          <div className="text-sm text-zinc-400">
            Par time: <span className="text-amber-300">{parSeconds}s</span> — over par adds +1.0s
          </div>
        )}
        {state.players.map((p) => (
          <PlayerScoreCard
            key={p.id}
            playerId={p.id}
            name={p.name}
            entry={state.scores[p.id]}
            onChange={(entry) =>
              dispatch({ type: "SET_SCORE", playerId: p.id, entry })
            }
          />
        ))}
      </Panel>
      <button
        disabled={!allEntered}
        onClick={onSubmit}
        className="rounded-md bg-red-700 px-4 py-3 font-semibold uppercase tracking-wide text-white enabled:hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        {submitLabel}
      </button>
    </div>
  );
}
