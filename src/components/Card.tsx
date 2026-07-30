import type { ReactNode } from "react";

export type CardTheme =
  | "time"
  | "distance"
  | "startPosition"
  | "target"
  | "courseOfFire"
  | "challenge"
  | "whoopsie"
  | "neutral";

const THEME: Record<CardTheme, { border: string; label: string; text: string }> = {
  time: { border: "border-amber-400", label: "Time", text: "text-amber-300" },
  distance: { border: "border-sky-400", label: "Distance", text: "text-sky-300" },
  startPosition: { border: "border-emerald-400", label: "Start Position", text: "text-emerald-300" },
  target: { border: "border-orange-500", label: "Target", text: "text-orange-300" },
  courseOfFire: { border: "border-red-500", label: "Course of Fire", text: "text-red-300" },
  challenge: { border: "border-fuchsia-400", label: "Challenge", text: "text-orange-300" },
  whoopsie: { border: "border-pink-500", label: "Whoopsie", text: "text-white" },
  neutral: { border: "border-zinc-500", label: "", text: "text-zinc-200" },
};

export function GameCard({
  theme,
  title,
  subtitle,
  label,
  footer,
  className = "",
}: {
  theme: CardTheme;
  title: ReactNode;
  subtitle?: ReactNode;
  label?: string;
  footer?: ReactNode;
  className?: string;
}) {
  const t = THEME[theme];
  return (
    <div
      className={`flex flex-col rounded-xl border-2 ${t.border} bg-gradient-to-b from-zinc-900 to-black p-3 shadow-lg ${className}`}
    >
      <div className={`mb-2 text-center text-xs font-semibold uppercase tracking-wider ${t.text}`}>
        {label ?? t.label}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-1 text-center">
        <div className={`text-lg font-bold leading-tight ${t.text}`}>{title}</div>
        {subtitle && <div className="text-xs text-zinc-400">{subtitle}</div>}
      </div>
      {footer && <div className="mt-2 text-center text-[11px] text-zinc-500">{footer}</div>}
    </div>
  );
}
