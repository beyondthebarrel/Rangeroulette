import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/AuthContext";
import { recordMatchResult } from "../leaderboard/storage";
import { initialState, reducer, type Action } from "./reducer";
import type { GameState } from "./types";

const STORAGE_KEY = "range-roulette-state-v1";

function loadInitial(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    return JSON.parse(raw) as GameState;
  } catch {
    return initialState();
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);
  const { user } = useAuth();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.phase !== "matchOver" || !state.winnerId || !user) return;
    const winner = state.players.find((p) => p.id === state.winnerId);
    if (!winner) return;
    recordMatchResult(
      state.matchId,
      state.players.map((p) => p.name),
      winner.name,
      user.id,
    ).catch((err) => console.error("Failed to record match result", err));
  }, [state.phase, state.winnerId, state.matchId, state.players, user]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
