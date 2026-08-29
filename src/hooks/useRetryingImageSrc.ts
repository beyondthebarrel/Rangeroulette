import { useEffect, useState } from "react";

/** Backoff doubles from 300ms up to this ceiling, then holds steady — retries never stop outright. */
const MAX_RETRY_DELAY_MS = 10_000;

/**
 * Auto-retries a failed image load indefinitely, with exponential backoff capped
 * at MAX_RETRY_DELAY_MS, and retries immediately when the browser regains
 * connectivity. Cache-busts each attempt so a real dead spot in coverage (this
 * app is meant to be used at a range) doesn't leave a card permanently blank.
 */
export function useRetryingImageSrc(baseSrc: string) {
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setRetryCount(0);
  }, [baseSrc]);

  useEffect(() => {
    const retryNow = () => setRetryCount((c) => c + 1);
    window.addEventListener("online", retryNow);
    return () => window.removeEventListener("online", retryNow);
  }, []);

  function onError() {
    const delay = Math.min(300 * 2 ** retryCount, MAX_RETRY_DELAY_MS);
    setTimeout(() => setRetryCount((c) => c + 1), delay);
  }

  const src = retryCount > 0 ? `${baseSrc}?retry=${retryCount}` : baseSrc;
  return { src, onError };
}
