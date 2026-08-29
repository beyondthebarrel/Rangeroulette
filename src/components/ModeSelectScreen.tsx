import { HeroBackdrop } from "./HeroBackdrop";
import { RetryImage } from "./RetryImage";
import { TitleFrame } from "./TitleFrame";

function CardsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="6" width="14" height="16" rx="2" transform="rotate(-8 9 14)" />
      <rect x="8" y="4" width="14" height="16" rx="2" />
    </svg>
  );
}

function StopwatchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="13" r="8" />
      <line x1="12" y1="13" x2="12" y2="8" />
      <line x1="12" y1="13" x2="15.5" y2="14.5" />
      <line x1="9" y1="2" x2="15" y2="2" />
      <line x1="12" y1="2" x2="12" y2="5" />
    </svg>
  );
}

function ModeButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl border-2 border-red-700 bg-zinc-900/60 p-2 text-left hover:bg-zinc-900 sm:gap-3 sm:p-4"
    >
      <span className="shrink-0 text-red-500">{icon}</span>
      <span>
        <span className="block text-sm font-bold uppercase tracking-wide text-white sm:text-lg">
          {title}
        </span>
        <span className="block text-[10px] leading-snug text-zinc-400 sm:text-xs">
          {description}
        </span>
      </span>
    </button>
  );
}

export function ModeSelectScreen({
  onSelectGame,
  onSelectTrain,
  onOpenLeaderboard,
  onOpenRules,
}: {
  onSelectGame: () => void;
  onSelectTrain: () => void;
  onOpenLeaderboard: () => void;
  onOpenRules: () => void;
}) {
  return (
    <HeroBackdrop>
      <TitleFrame>
        <img
          src="/badge-wheel.jpg"
          alt="Range Roulette — every draw is a new problem"
          className="w-full max-w-[130px] rounded-md sm:max-w-[260px]"
        />

        <div className="flex w-full flex-col gap-2">
          <ModeButton
            icon={<CardsIcon className="h-7 w-7 sm:h-10 sm:w-10" />}
            title="Game Mode"
            description="Pass-and-play card game for 2+ shooters"
            onClick={onSelectGame}
          />
          <ModeButton
            icon={<StopwatchIcon className="h-7 w-7 sm:h-10 sm:w-10" />}
            title="Train Mode"
            description="Solo random drill generator & performance log"
            onClick={onSelectTrain}
          />
        </div>

        <div className="flex w-full gap-2">
          <button
            onClick={onOpenRules}
            className="flex-1 rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-900 sm:py-2 sm:text-sm"
          >
            How to Play
          </button>
          <button
            onClick={onOpenLeaderboard}
            className="flex-1 rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-900 sm:py-2 sm:text-sm"
          >
            Leaderboard
          </button>
        </div>

        <RetryImage
          src="/btb-logo.png"
          alt="Beyond the Barrel Concepts"
          className="w-16 opacity-90 sm:mt-1 sm:w-32"
        />
      </TitleFrame>
    </HeroBackdrop>
  );
}
