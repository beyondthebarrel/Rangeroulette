import { useGame } from "../game/GameContext";
import { Panel } from "./Panel";
import { PlayingCard } from "./PlayingCard";

export function ActiveWhoopsiePanel() {
  const { state } = useGame();
  if (state.activeWhoopsies.length === 0) return null;

  return (
    <Panel>
      <div className="text-sm font-semibold text-pink-400">Active Whoopsie</div>
      <ul className="flex flex-col gap-2">
        {state.activeWhoopsies.map((w) => (
          <li key={w.instance.instanceId} className="flex items-center gap-3">
            <PlayingCard cardId={w.instance.def.id} className="w-16 shrink-0" />
            <span className="text-sm text-pink-200">
              {w.instance.def.text}{" "}
              <span className="text-xs text-zinc-500">
                ({w.roundsRemaining} round{w.roundsRemaining > 1 ? "s" : ""} left)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
