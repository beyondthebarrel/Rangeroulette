import { useEffect, useState } from "react";
import {
  CATEGORY_DECKS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type CategoryCardDef,
  type CategoryKey,
} from "../data/cards";
import { useGame } from "../game/GameContext";
import { Panel } from "./Panel";
import { PlayingCard } from "./PlayingCard";

const DROPDOWN_CATEGORIES: CategoryKey[] = ["startPosition", "target", "courseOfFire"];

function optionLabel(def: CategoryCardDef): string {
  return def.detail ? `${def.label} — ${def.detail}` : def.label;
}

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
  const missingDealersChoice = needsDealersChoice.filter(
    (cat) => (drill.dealersChoiceValues[cat] ?? "").trim().length === 0,
  );
  const readyToScore = missingDealersChoice.length === 0;

  const playersWithCards = state.players.filter((p) => p.hand.length > 0);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <Panel>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Round {state.round}</h2>
          <div className="text-sm text-zinc-400">
            Dealer: <span className="text-white">{dealer?.name}</span>
          </div>
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
                    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-black/80 p-1.5">
                      {!(drill.dealersChoiceValues[cat] ?? "").trim() && (
                        <div className="text-center text-[10px] font-semibold uppercase tracking-wide text-red-400">
                          Dealer must set a value
                        </div>
                      )}
                      {DROPDOWN_CATEGORIES.includes(cat) ? (
                        <select
                          value={drill.dealersChoiceValues[cat] ?? ""}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_DEALERS_CHOICE",
                              category: cat,
                              value: e.target.value,
                            })
                          }
                          className={`w-full rounded border bg-zinc-900 px-1 py-1 text-center text-[11px] text-white focus:outline-none ${
                            (drill.dealersChoiceValues[cat] ?? "").trim()
                              ? "border-red-700"
                              : "animate-pulse border-red-500 ring-2 ring-red-500"
                          }`}
                        >
                          <option value="" disabled>
                            choose one
                          </option>
                          {CATEGORY_DECKS[cat].map((def) => (
                            <option key={def.id} value={optionLabel(def)}>
                              {optionLabel(def)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={drill.dealersChoiceValues[cat] ?? ""}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_DEALERS_CHOICE",
                              category: cat,
                              value: e.target.value,
                            })
                          }
                          placeholder="type value here"
                          className={`w-full rounded border bg-zinc-900 px-1.5 py-1 text-center text-xs text-white focus:outline-none ${
                            (drill.dealersChoiceValues[cat] ?? "").trim()
                              ? "border-red-700"
                              : "animate-pulse border-red-500 ring-2 ring-red-500"
                          }`}
                        />
                      )}
                    </div>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      </Panel>

      {drill.activeChallenges.length > 0 && (
        <Panel>
          <div className="text-sm font-semibold text-red-400">
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
                      className="ml-2 rounded bg-red-700 px-2 py-0.5 text-xs text-white hover:bg-red-600"
                    >
                      Reverse onto {state.players.find((p) => p.id === c.playedBy)?.name}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      {playersWithCards.length > 0 && (
        <Panel>
          <div className="text-sm font-semibold text-zinc-300">
            Play a Challenge Card (optional)
          </div>
          <div className="flex flex-col gap-3">
            {playersWithCards.map((p) => (
              <div key={p.id} className="flex flex-col gap-2">
                <span className="text-sm text-white">{p.name}</span>
                <div className="flex flex-wrap gap-2">
                  {p.hand.map((c) => (
                    <button
                      key={c.instanceId}
                      onClick={() =>
                        setPlayFor(playFor === c.instanceId ? null : c.instanceId)
                      }
                      className={`w-16 shrink-0 rounded-lg transition ${
                        playFor === c.instanceId
                          ? "ring-2 ring-red-500"
                          : "hover:ring-2 hover:ring-red-800"
                      }`}
                      title={c.def.text}
                    >
                      <PlayingCard cardId={c.def.id} />
                    </button>
                  ))}
                </div>
                {p.hand.map(
                  (c) =>
                    playFor === c.instanceId && (
                      <div
                        key={`${c.instanceId}-target`}
                        className="flex flex-wrap items-center gap-2 rounded bg-zinc-900 p-2 text-xs"
                      >
                        <span className="text-zinc-400">{c.def.text} — play on:</span>
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
                            className="rounded bg-red-700 px-2 py-0.5 text-white hover:bg-red-600"
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    ),
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {!readyToScore && (
        <div className="text-center text-sm text-red-400">
          Waiting on Dealer&apos;s Choice value
          {missingDealersChoice.length > 1 ? "s" : ""} for:{" "}
          {missingDealersChoice.map((cat) => CATEGORY_LABELS[cat]).join(", ")}
        </div>
      )}
      <button
        disabled={!readyToScore}
        onClick={() => dispatch({ type: "START_SCORING" })}
        className="rounded-md bg-red-700 px-4 py-3 font-semibold uppercase tracking-wide text-white enabled:hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        Run the Drill →
      </button>
    </div>
  );
}
