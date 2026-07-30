import { useEffect, useState } from "react";
import { CATEGORY_ORDER, type CategoryKey } from "../data/cards";
import { useGame } from "../game/GameContext";
import { GameCard, type CardTheme } from "./Card";

const THEME_BY_CATEGORY: Record<CategoryKey, CardTheme> = {
  time: "time",
  distance: "distance",
  startPosition: "startPosition",
  target: "target",
  courseOfFire: "courseOfFire",
};

export function RoundBuildScreen() {
  const { state, dispatch } = useGame();
  const drill = state.currentDrill;
  const dealer = state.players[state.dealerIndex];
  const [playFor, setPlayFor] = useState<string | null>(null);

  useEffect(() => {
    if (!drill) dispatch({ type: "DRAW_ROUND" });
  }, [drill, dispatch]);

  if (!drill) {
    return <div className="p-6 text-white">Drawing cards…</div>;
  }

  const needsDealersChoice = CATEGORY_ORDER.filter(
    (cat) => drill.cards[cat]?.def.dealersChoice,
  );
  const readyToScore = needsDealersChoice.every(
    (cat) => (drill.dealersChoiceValues[cat] ?? "").trim().length > 0,
  );

  const playersWithCards = state.players.filter((p) => p.hand.length > 0);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Round {state.round}</h2>
        <div className="text-sm text-zinc-400">
          Dealer: <span className="text-white">{dealer?.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATEGORY_ORDER.map((cat) => {
          const card = drill.cards[cat];
          if (!card) return null;
          if (card.def.dealersChoice) {
            return (
              <GameCard
                key={cat}
                theme={THEME_BY_CATEGORY[cat]}
                title="Dealer's Choice"
                subtitle={
                  <input
                    value={drill.dealersChoiceValues[cat] ?? ""}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_DEALERS_CHOICE",
                        category: cat,
                        value: e.target.value,
                      })
                    }
                    placeholder="dealer sets value"
                    className="mt-1 w-full rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-center text-white"
                  />
                }
              />
            );
          }
          return (
            <GameCard
              key={cat}
              theme={THEME_BY_CATEGORY[cat]}
              title={card.def.label}
              subtitle={card.def.detail}
            />
          );
        })}
      </div>

      {drill.activeChallenges.length > 0 && (
        <div className="rounded-lg border border-fuchsia-600 bg-fuchsia-950/30 p-3">
          <div className="mb-2 text-sm font-semibold text-fuchsia-300">
            Active Challenge Cards
          </div>
          <ul className="flex flex-col gap-2">
            {drill.activeChallenges.map((c, i) => {
              const target = state.players.find((p) => p.id === c.targetPlayerId);
              const targetHasReverse = target?.hand.some(
                (h) => h.def.autoEffect === "reverseChallenge",
              );
              return (
                <li key={c.instance.instanceId} className="text-sm text-zinc-200">
                  <span className="text-white">{target?.name}</span>: {c.instance.def.text}
                  {targetHasReverse && (
                    <button
                      onClick={() =>
                        dispatch({ type: "REVERSE_CHALLENGE", activeIndex: i })
                      }
                      className="ml-2 rounded bg-fuchsia-700 px-2 py-0.5 text-xs text-white hover:bg-fuchsia-600"
                    >
                      Reverse onto {state.players.find((p) => p.id === c.playedBy)?.name}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {playersWithCards.length > 0 && (
        <div className="rounded-lg border border-zinc-700 p-3">
          <div className="mb-2 text-sm font-semibold text-zinc-300">
            Play a Challenge Card (optional)
          </div>
          <div className="flex flex-col gap-2">
            {playersWithCards.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-white">{p.name}:</span>
                {p.hand.map((c) => (
                  <button
                    key={c.instanceId}
                    onClick={() => setPlayFor(playFor === c.instanceId ? null : c.instanceId)}
                    className="rounded bg-zinc-700 px-2 py-1 text-xs text-white hover:bg-zinc-600"
                  >
                    {c.def.text}
                  </button>
                ))}
                {p.hand.map(
                  (c) =>
                    playFor === c.instanceId && (
                      <div key={`${c.instanceId}-target`} className="flex gap-1">
                        {state.players.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              dispatch({
                                type: "PLAY_CHALLENGE",
                                playerId: p.id,
                                instanceId: c.instanceId,
                                targetPlayerId: t.id,
                              });
                              setPlayFor(null);
                            }}
                            className="rounded bg-fuchsia-700 px-2 py-0.5 text-xs text-white hover:bg-fuchsia-600"
                          >
                            on {t.name}
                          </button>
                        ))}
                      </div>
                    ),
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        disabled={!readyToScore}
        onClick={() => dispatch({ type: "START_SCORING" })}
        className="rounded-md bg-emerald-600 px-4 py-3 font-semibold text-white enabled:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        Run the Drill →
      </button>
    </div>
  );
}
