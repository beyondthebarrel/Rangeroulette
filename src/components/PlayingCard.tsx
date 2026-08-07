import { useEffect, useState, type ReactNode } from "react";
import { useRetryingImageSrc } from "../hooks/useRetryingImageSrc";

function CardBackMark() {
  return (
    <svg viewBox="0 0 100 100" className="h-1/3 w-1/3 opacity-90">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#dc2626" strokeWidth="2" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="#dc2626" strokeWidth="1.5" />
      <line x1="50" y1="4" x2="50" y2="20" stroke="#dc2626" strokeWidth="2" />
      <line x1="50" y1="80" x2="50" y2="96" stroke="#dc2626" strokeWidth="2" />
      <line x1="4" y1="50" x2="20" y2="50" stroke="#dc2626" strokeWidth="2" />
      <line x1="80" y1="50" x2="96" y2="50" stroke="#dc2626" strokeWidth="2" />
      <circle cx="50" cy="50" r="4" fill="#dc2626" />
    </svg>
  );
}

export function PlayingCard({
  cardId,
  overlay,
  className = "",
  faceDown = false,
}: {
  cardId: string;
  overlay?: ReactNode;
  className?: string;
  faceDown?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const { src, onError } = useRetryingImageSrc(`/cards/${cardId}.jpg`);

  useEffect(() => {
    if (faceDown) {
      setRevealed(false);
      return;
    }
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 150);
    return () => clearTimeout(t);
  }, [cardId, faceDown]);

  return (
    <div className={`[perspective:1000px] ${className}`}>
      <div
        className="relative aspect-[552/812] w-full transition-transform duration-500 ease-out [transform-style:preserve-3d]"
        style={{ transform: revealed ? "rotateY(0deg)" : "rotateY(180deg)" }}
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
          className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl border-2 border-red-700 bg-black shadow-lg [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <CardBackMark />
        </div>
      </div>
    </div>
  );
}
