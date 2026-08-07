import type {
  CategoryCardDef,
  CategoryKey,
  ChallengeCardDef,
  WhoopsieCardDef,
} from "../data/cards";

export interface CardInstance<D> {
  instanceId: string;
  def: D;
}

export type CategoryCardInstance = CardInstance<CategoryCardDef>;
export type ChallengeCardInstance = CardInstance<ChallengeCardDef>;
export type WhoopsieCardInstance = CardInstance<WhoopsieCardDef>;

export interface DeckState<T> {
  draw: T[];
  discard: T[];
}

export interface Player {
  id: string;
  name: string;
  points: number;
  hand: ChallengeCardInstance[];
}

export interface ActiveChallenge {
  instance: ChallengeCardInstance;
  playedBy: string;
  targetPlayerId: string;
}

export interface ActiveWhoopsie {
  instance: WhoopsieCardInstance;
  calledBy: string;
  roundsRemaining: number;
}

export interface ScoreEntry {
  rawSeconds: number | null;
  zoneMisses: number;
  completeMisses: number;
  dnf: boolean;
}

export interface CurrentDrill {
  isBillDrill: boolean;
  cards: Partial<Record<CategoryKey, CategoryCardInstance>>;
  dealersChoiceValues: Partial<Record<CategoryKey, string>>;
  activeChallenges: ActiveChallenge[];
}

export type Phase =
  | "setup"
  | "billDrill"
  | "build"
  | "score"
  | "roundResult"
  | "matchOver";

export interface RoundResult {
  finalTimes: Record<string, number | null>;
  winnerId: string | null;
  tie: boolean;
  tiedIds: string[];
  awardedChallenge: ChallengeCardInstance | null;
  donations: { fromId: string; toId: string }[];
}

export interface GameState {
  phase: Phase;
  matchId: string;
  players: Player[];
  dealerIndex: number;
  round: number;
  pointsToWin: number;
  categoryDecks: Record<CategoryKey, DeckState<CategoryCardInstance>>;
  challengeDeck: DeckState<ChallengeCardInstance>;
  whoopsieDeck: DeckState<WhoopsieCardInstance>;
  currentDrill: CurrentDrill | null;
  activeWhoopsies: ActiveWhoopsie[];
  scores: Record<string, ScoreEntry>;
  lastRoundResult: RoundResult | null;
  winnerId: string | null;
}
