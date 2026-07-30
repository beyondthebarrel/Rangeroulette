import type { DeckState } from "./types";

let counter = 0;
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildDeck<Def extends { qty: number }, Inst extends { def: Def }>(
  defs: Def[],
  prefix: string,
  wrap: (def: Def, instanceId: string) => Inst,
): DeckState<Inst> {
  const instances: Inst[] = [];
  defs.forEach((def) => {
    for (let i = 0; i < def.qty; i += 1) {
      instances.push(wrap(def, nextId(prefix)));
    }
  });
  return { draw: shuffle(instances), discard: [] };
}

/** Draws one card, reshuffling the discard pile back in if the draw pile is empty. */
export function drawOne<T>(deck: DeckState<T>): { card: T; deck: DeckState<T> } {
  if (deck.draw.length === 0) {
    if (deck.discard.length === 0) {
      throw new Error("Deck is empty with no discards to reshuffle.");
    }
    const reshuffled = shuffle(deck.discard);
    const [card, ...rest] = reshuffled;
    return { card, deck: { draw: rest, discard: [] } };
  }
  const [card, ...rest] = deck.draw;
  return { card, deck: { draw: rest, discard: deck.discard } };
}

export function discardTo<T>(deck: DeckState<T>, card: T): DeckState<T> {
  return { draw: deck.draw, discard: [...deck.discard, card] };
}
