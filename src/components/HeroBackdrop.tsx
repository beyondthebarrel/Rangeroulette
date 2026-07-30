import type { ReactNode } from "react";

export function HeroBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: "url(/hero-target.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/90" />
      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}
