import { useState } from "react";
import { useGame } from "../game/GameContext";

export function PlayerSetup() {
  const { dispatch } = useGame();
  const [names, setNames] = useState<string[]>(["", ""]);

  function updateName(i: number, value: string) {
    setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));
  }

  function addPlayer() {
    setNames((prev) => [...prev, ""]);
  }

  function removePlayer(i: number) {
    setNames((prev) => prev.filter((_, idx) => idx !== i));
  }

  const validNames = names.map((n) => n.trim()).filter(Boolean);
  const canStart = validNames.length >= 2;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold text-white">Range Roulette</h1>
      <p className="text-sm text-zinc-400">
        Enter each shooter's name. First to 5 points wins.
      </p>
      <div className="flex flex-col gap-2">
        {names.map((n, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={n}
              onChange={(e) => updateName(i, e.target.value)}
              placeholder={`Shooter ${i + 1}`}
              className="flex-1 rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-white"
            />
            {names.length > 2 && (
              <button
                onClick={() => removePlayer(i)}
                className="rounded bg-zinc-700 px-3 text-white hover:bg-zinc-600"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={addPlayer}
        className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
      >
        + Add Shooter
      </button>
      <button
        disabled={!canStart}
        onClick={() => dispatch({ type: "START_MATCH", names: validNames })}
        className="rounded-md bg-emerald-600 px-4 py-3 font-semibold text-white enabled:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        Start with Bill Drill
      </button>
      <p className="text-xs text-zinc-500">
        Everyone shoots a Bill Drill first (10 rounds, 5 yards, A-zone) — fastest
        goes first.
      </p>
    </div>
  );
}
