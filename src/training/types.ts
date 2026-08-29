import type { CategoryKey } from "../data/cards";

export interface TrainingDrillCard {
  cardId: string;
  label: string;
  detail?: string;
}

export type TrainingDrill = Record<CategoryKey, TrainingDrillCard> & {
  parSeconds?: number;
};

export interface TrainingSession {
  id: string;
  trainee: string;
  loggedAt: string;
  drill: TrainingDrill;
  rawSeconds: number;
  zoneMisses: number;
  completeMisses: number;
  finalSeconds: number;
  /** Name of the saved drill this was logged against, if any (not the current name — a snapshot from log time). */
  savedDrillName?: string;
}
