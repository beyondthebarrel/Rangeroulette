import { useEffect, useState, type ReactNode } from "react";
import { useRetryingImageSrc } from "../hooks/useRetryingImageSrc";

export function PlayingCard({
  cardId,
  overlay,
  className = "",
  faceDown = false,
  tappable = false,
  onReveal,
  backImage = "/card-back.jpg",
}: {
  cardId: string;
  overlay?: ReactNode;
  className?: string;
  faceDown?: boolean;
  /** When true and faceDown, the card stays face down until tapped. */
  tappable?: boolean;
  onReveal?: () => void;
  /** Back-of-card art. Defaults to the standard Range Roulette back. */
  backImage?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const [tapped, setTapped] = useState(false);
  const { src, onError } = useRetryingImageSrc(`/cards/${cardId}.jpg`);
  const { src: backSrc, onError: backOnError } = useRetryingImageSrc(backImage);

  useEffect(() => {
    setTapped(false);
    if (faceDown) {
      setRevealed(false);
      return;
    }
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 150);
    return () => clearTimeout(t);
  }, [cardId, faceDown]);

  const showFace = revealed || tapped;
  const isTappable = tappable && faceDown && !tapped;

  function handleTap() {
    if (!isTappable) return;
    setTapped(true);
    onReveal?.();
  }

  return (
    <div
      className={`[perspective:1000px] ${isTappable ? "cursor-pointer" : ""} ${className}`}
      onClick={handleTap}
      role={isTappable ? "button" : undefined}
      tabIndex={isTappable ? 0 : undefined}
      onKeyDown={
        isTappable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleTap();
              }
            }
          : undefined
      }
      aria-label={isTappable ? "Tap to reveal card" : undefined}
    >
      <div
        className="relative aspect-[552/812] w-full transition-transform duration-500 ease-out [transform-style:preserve-3d]"
        style={{ transform: showFace ? "rotateY(0deg)" : "rotateY(180deg)" }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-xl shadow-lg [backface-visibility:hidden]">
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
            onError={onError}
          />
          {overlay}
        </div>
        <div
          className="absolute inset-0 overflow-hidden rounded-xl shadow-lg [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <img
            src={backSrc}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
            onError={backOnError}
          />
          {isTappable && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/80 py-1.5 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500">
                Tap to Reveal
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
