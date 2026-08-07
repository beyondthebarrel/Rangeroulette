import { useEffect, useState } from "react";

const MAX_IMAGE_RETRIES = 4;

/** Auto-retries a failed image load with exponential backoff, cache-busting each attempt. */
export function useRetryingImageSrc(baseSrc: string) {
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setRetryCount(0);
  }, [baseSrc]);

  function onError() {
    if (retryCount >= MAX_IMAGE_RETRIES) return;
    const delay = 300 * 2 ** retryCount;
    setTimeout(() => setRetryCount((c) => c + 1), delay);
  }

  const src = retryCount > 0 ? `${baseSrc}?retry=${retryCount}` : baseSrc;
  return { src, onError };
}
