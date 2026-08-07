import { useState } from "react";
import { useGame } from "../game/GameContext";
import { HeroBackdrop } from "./HeroBackdrop";
import { TitleFrame } from "./TitleFrame";

export function PlayerSetup({
  onBackToModes,
}: {
  onBackToModes: () => void;
}) {
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
        <h1 className="text-2xl font-bold uppercase tracking-wide text-red-500">
          Game Mode
        </h1>

        <div className="flex w-full flex-col gap-1.5 sm:gap-2">
          {names.map((n, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={n}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`Shooter ${i + 1}`}
                className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-white focus:border-red-600 focus:outline-none sm:py-2"
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
          className="w-full rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900 sm:py-2"
        >
          + Add Shooter
        </button>

        <button
          disabled={!canStart}
          onClick={() => dispatch({ type: "START_MATCH", names: validNames })}
          className="w-full rounded-md bg-red-700 px-4 py-2.5 font-semibold uppercase tracking-wide text-white enabled:hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 sm:py-3"
        >
          Start with Bill Drill
        </button>

        <p className="text-center text-[11px] leading-snug text-zinc-500 sm:text-xs">
          Everyone shoots a Bill Drill first (6 rounds, 7 yards, A-zone) —
          fastest goes first. First to 5 points wins.
        </p>

        <button
          onClick={onBackToModes}
          className="w-full rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900 sm:py-2"
        >
          ← Modes
        </button>
      </TitleFrame>
    </HeroBackdrop>
  );
}
