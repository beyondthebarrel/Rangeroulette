import { useGame } from "../game/GameContext";

export function MatchOverScreen() {
  const { state, dispatch } = useGame();
  const winner = state.players.find((p) => p.id === state.winnerId);
  const ranked = [...state.players].sort((a, b) => b.points - a.points);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold text-emerald-400">{winner?.name} Wins!</h1>
      <div className="flex flex-col gap-2">
        {ranked.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-zinc-700 p-3"
          >
            <span className="text-white">{p.name}</span>
            <span className="text-emerald-400">{p.points} pts</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => dispatch({ type: "RESET_MATCH" })}
        className="rounded-md bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-500"
      >
        New Match
      </button>
    </div>
  );
}
