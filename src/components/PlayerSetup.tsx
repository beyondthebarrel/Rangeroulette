import { useState } from "react";
import { useGame } from "../game/GameContext";
import { HeroBackdrop } from "./HeroBackdrop";
import { RangeRouletteBadge } from "./RangeRouletteBadge";
import { TitleFrame } from "./TitleFrame";

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
    <HeroBackdrop>
      <TitleFrame>
        <RangeRouletteBadge />
        <p className="-mt-2 text-center text-xs uppercase tracking-widest text-red-500">
          Every draw is a new problem.
        </p>

        <div className="flex w-full flex-col gap-2">
          {names.map((n, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={n}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`Shooter ${i + 1}`}
                className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-red-600 focus:outline-none"
              />
              {names.length > 2 && (
                <button
                  onClick={() => removePlayer(i)}
                  className="rounded bg-zinc-800 px-3 text-white hover:bg-zinc-700"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addPlayer}
          className="w-full rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
        >
          + Add Shooter
        </button>

        <button
          disabled={!canStart}
          onClick={() => dispatch({ type: "START_MATCH", names: validNames })}
          className="w-full rounded-md bg-red-700 px-4 py-3 font-semibold uppercase tracking-wide text-white enabled:hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          Start with Bill Drill
        </button>

        <p className="text-center text-xs text-zinc-500">
          Everyone shoots a Bill Drill first (10 rounds, 5 yards, A-zone) —
          fastest goes first. First to 5 points wins.
        </p>

        <img
          src="/btb-logo.png"
          alt="Beyond the Barrel Concepts"
          className="mt-1 w-32 opacity-90"
        />
      </TitleFrame>
    </HeroBackdrop>
  );
}
