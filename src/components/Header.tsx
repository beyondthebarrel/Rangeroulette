import { useState } from "react";
import { useGame } from "../game/GameContext";

export function Header() {
  const { state, dispatch } = useGame();
  const [confirming, setConfirming] = useState(false);

  if (state.phase === "setup") return null;

  return (
    <div className="border-b border-zinc-800 bg-zinc-950/80 px-4 py-2">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <div className="flex flex-wrap gap-3 text-sm text-zinc-300">
          {state.players.map((p) => (
            <span key={p.id}>
              {p.name} <span className="text-emerald-400">{p.points}</span>
            </span>
          ))}
        </div>
        {confirming ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">End match?</span>
            <button
              onClick={() => {
                dispatch({ type: "RESET_MATCH" });
                setConfirming(false);
              }}
              className="rounded bg-red-700 px-2 py-1 text-white hover:bg-red-600"
            >
              Yes, Title Screen
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded bg-zinc-700 px-2 py-1 text-white hover:bg-zinc-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            ← Title Screen
          </button>
        )}
      </div>
      {state.activeWhoopsies.length > 0 && (
        <div className="mx-auto mt-1 max-w-3xl text-xs text-pink-300">
          Active Whoopsie:{" "}
          {state.activeWhoopsies.map((w) => w.instance.def.text).join(" · ")}
        </div>
      )}
    </div>
  );
}
