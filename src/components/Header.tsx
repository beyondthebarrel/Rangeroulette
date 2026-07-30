import { useGame } from "../game/GameContext";

export function Header() {
  const { state, dispatch } = useGame();
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
        <button
          onClick={() => {
            if (confirm("Reset the whole match?")) {
              dispatch({ type: "RESET_MATCH" });
            }
          }}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Reset
        </button>
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
