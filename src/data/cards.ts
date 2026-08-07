export type CategoryKey =
  | "time"
  | "distance"
  | "startPosition"
  | "target"
  | "courseOfFire";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  time: "Time",
  distance: "Distance",
  startPosition: "Start Position",
  target: "Target",
  courseOfFire: "Course of Fire",
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "time",
  "distance",
  "startPosition",
  "target",
  "courseOfFire",
];

export interface CategoryCardDef {
  id: string;
  category: CategoryKey;
  label: string;
  detail?: string;
  /** Printed par time in seconds — only present on Time cards. */
  parSeconds?: number;
  qty: number;
  dealersChoice?: boolean;
}

function timeCard(seconds: number): CategoryCardDef {
  return {
    id: `time-${seconds}`,
    category: "time",
    label: `${seconds} Seconds`,
    parSeconds: seconds,
    qty: 4,
  };
}

function distanceCard(yards: number): CategoryCardDef {
  return {
    id: `distance-${yards}`,
    category: "distance",
    label: `${yards} Yards`,
    qty: 4,
  };
}

export const TIME_CARDS: CategoryCardDef[] = [2, 3, 4, 5, 6].map(timeCard);

export const DISTANCE_CARDS: CategoryCardDef[] = [2, 5, 7, 10, 12].map(
  distanceCard,
);

export const START_POSITION_CARDS: CategoryCardDef[] = [
  { id: "sp-hands-at-sides", label: "Holstered, Hands at Sides" },
  { id: "sp-low-ready", label: "Low Ready" },
  { id: "sp-180-turn", label: "Holstered, 180° Turn" },
  { id: "sp-wrists-above-shoulders", label: "Holstered, Wrists Above Shoulders" },
  { id: "sp-kneeling-wrists-above-shoulders", label: "Holstered, Kneeling, Wrists Above Shoulders" },
  { id: "sp-low-ready-empty-gun", label: "Low Ready, Empty Gun" },
].map((c) => ({ ...c, category: "startPosition" as const, qty: 4 }));

export const TARGET_CARDS: CategoryCardDef[] = [
  { id: "tg-1-a-zone", label: "1 USPSA A-Zone", detail: '6"x11"' },
  { id: "tg-3-a-zone-3yd", label: "3 USPSA A-Zone", detail: '6"x11", 3 yard spacing' },
  { id: "tg-1-head-box", label: "1 USPSA Head Box", detail: '2"x4"' },
  { id: "tg-2-a-zone-5yd", label: "2 USPSA A-Zone", detail: '6"x11", 5 yard spacing' },
  { id: "tg-2-a-zone-15yd", label: "2 USPSA A-Zone", detail: '6"x11", 15 yard spacing' },
  { id: "tg-2-head-box-7yd", label: "2 USPSA Head Box", detail: '2"x4", spaced 7 yards' },
].map((c) => ({ ...c, category: "target" as const, qty: 4 }));

export const COURSE_OF_FIRE_CARDS: CategoryCardDef[] = [
  { id: "cof-2-reload-after-first", label: "2 Shots on Each Target", detail: "Reload after first shot" },
  { id: "cof-3-each-target", label: "3 Rounds Each Target" },
  { id: "cof-failure-drill", label: "Failure Drill on Each Target", detail: "2 body, 1 head" },
  { id: "cof-1-repeat-3x", label: "1 Round Each Target, Then Repeat", detail: "3 times" },
  { id: "cof-2-strong-hand", label: "2 Rounds Each Target", detail: "Strong hand" },
  { id: "cof-1-each-target", label: "1 Round Each Target" },
].map((c) => ({ ...c, category: "courseOfFire" as const, qty: 4 }));

export const CATEGORY_DECKS: Record<CategoryKey, CategoryCardDef[]> = {
  time: TIME_CARDS,
  distance: DISTANCE_CARDS,
  startPosition: START_POSITION_CARDS,
  target: TARGET_CARDS,
  courseOfFire: COURSE_OF_FIRE_CARDS,
};

/** Dealer's Choice cards: one per category, qty 2 each. Shuffled into that category's deck. */
export function dealersChoiceCard(category: CategoryKey): CategoryCardDef {
  return {
    id: `dealers-choice-${category}`,
    category,
    label: "Dealer's Choice",
    qty: 2,
    dealersChoice: true,
  };
}

export function buildCategoryDeck(category: CategoryKey): CategoryCardDef[] {
  return [...CATEGORY_DECKS[category], dealersChoiceCard(category)];
}

export type ChallengeAutoEffect =
  | "plusHalfSecond"
  | "donateLastPlace"
  | "reverseChallenge";

export interface ChallengeCardDef {
  id: string;
  text: string;
  qty: number;
  autoEffect?: ChallengeAutoEffect;
}

export const CHALLENGE_CARDS: ChallengeCardDef[] = [
  // x1
  { id: "ch-leave-mags-on-ground", text: "Leave all magazines on the ground", qty: 1 },
  { id: "ch-stand-on-one-foot", text: "Stand on one foot for every shot", qty: 1 },
  { id: "ch-switch-hand-2h-grip", text: "Switch hand position on 2-handed grip", qty: 1 },
  { id: "ch-donate-point", text: "Donate 1 point to last place", qty: 1, autoEffect: "donateLastPlace" },
  { id: "ch-shoot-moving-away", text: "Shoot while moving away from target", qty: 1 },
  { id: "ch-add-2-shots", text: "Add 2 shots to the end of the drill", qty: 1 },
  { id: "ch-mystery-load", text: "Mystery load first magazine", qty: 1 },
  // x2
  { id: "ch-strong-hand-only", text: "Strong hand only", qty: 2 },
  { id: "ch-no-makeup-shots", text: "No makeup shots", qty: 2 },
  { id: "ch-forced-reload", text: "Add a forced reload", qty: 2 },
  { id: "ch-plus-half-second", text: "Plus 0.5 seconds", qty: 2, autoEffect: "plusHalfSecond" },
  // x3
  { id: "ch-reverse", text: "Reverse a challenge card being played on you", qty: 3, autoEffect: "reverseChallenge" },
  { id: "ch-weak-hand", text: "Draw using weak hand", qty: 3 },
];

export interface WhoopsieCardDef {
  id: string;
  text: string;
  qty: number;
  rounds: number;
  drawsChallengeForAll?: boolean;
}

export const WHOOPSIE_CARDS: WhoopsieCardDef[] = [
  { id: "wh-prone", text: "Next drill is shot from the prone position", qty: 1, rounds: 1 },
  {
    id: "wh-draw-challenge-all",
    text: 'Holder of the "Whoopsie" card draws a Challenge card which will affect all shooters on the next drill',
    qty: 1,
    rounds: 1,
    drawsChallengeForAll: true,
  },
  { id: "wh-deep-squat", text: "Hold a deep squat start position for the next 2 drills", qty: 1, rounds: 2 },
  { id: "wh-swap-guns", text: "Everyone swap guns to finish on the next 2 drills", qty: 1, rounds: 2 },
  { id: "wh-high-knees", text: "Perform high knees to finish on the next drill", qty: 1, rounds: 1 },
  { id: "wh-gun-on-ground", text: "Start next drill with your gun belt on the ground (off body)", qty: 1, rounds: 1 },
];

export const SCORING = {
  zoneMissPenalty: 0.5,
  completeMissPenalty: 1.0,
  overParPenalty: 1.0,
  pointsToWin: 5,
};

export const BILL_DRILL = {
  label: "Bill Drill",
  detail: "6 rounds, 7 yards, A-zone",
  parSeconds: undefined as number | undefined,
};
