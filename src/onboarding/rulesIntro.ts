const SEEN_KEY = "range-roulette-seen-rules-intro-v1";

export function hasSeenRulesIntro(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markRulesIntroSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // ignore — non-critical convenience feature
  }
}
