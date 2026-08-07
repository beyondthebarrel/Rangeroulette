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
}
