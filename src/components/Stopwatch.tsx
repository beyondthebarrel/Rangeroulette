import { useEffect, useRef, useState } from "react";

type Stage = "idle" | "waiting" | "running" | "stopped";

const COUNTDOWN_BEEPS = 3;
const BEEP_INTERVAL_MS = 650;
const START_DELAY_MS = 550;

function beep(frequency: number, durationSec: number) {
  const AudioCtx =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = frequency;
  gain.gain.value = 0.2;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationSec);
  osc.onended = () => ctx.close();
}

export function Stopwatch({ onCapture }: { onCapture: (seconds: number) => void }) {
  const [stage, setStage] = useState<Stage>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_BEEPS);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  function tick() {
    setElapsedMs(performance.now() - startRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }

  function start() {
    setStage("waiting");
    setElapsedMs(0);
    setCountdown(COUNTDOWN_BEEPS);
    timeoutsRef.current = [];

    for (let i = 0; i < COUNTDOWN_BEEPS; i += 1) {
      const id = window.setTimeout(() => {
        beep(900, 0.12);
        setCountdown(COUNTDOWN_BEEPS - i - 1);
      }, i * BEEP_INTERVAL_MS);
      timeoutsRef.current.push(id);
    }

    const startAt = COUNTDOWN_BEEPS * BEEP_INTERVAL_MS + START_DELAY_MS;
    const startId = window.setTimeout(() => {
      beep(1800, 0.3);
      startRef.current = performance.now();
      setStage("running");
      rafRef.current = requestAnimationFrame(tick);
    }, startAt);
    timeoutsRef.current.push(startId);
  }

  function stop() {
    cancelAnimationFrame(rafRef.current);
    setStage("stopped");
  }

  function reset() {
    cancelAnimationFrame(rafRef.current);
    timeoutsRef.current.forEach(clearTimeout);
    setStage("idle");
    setElapsedMs(0);
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <div className="font-mono text-4xl tabular-nums text-white">
        {(elapsedMs / 1000).toFixed(2)}s
      </div>
      {stage === "idle" && (
        <button
          onClick={start}
          className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500"
        >
          Start (3-beep countdown)
        </button>
      )}
      {stage === "waiting" && (
        <div className="text-sm text-amber-300">
          {countdown > 0 ? `Standby… ${countdown}` : "Standby…"}
        </div>
      )}
      {stage === "running" && (
        <button
          onClick={stop}
          className="rounded-md bg-red-600 px-6 py-3 text-lg font-bold text-white hover:bg-red-500"
        >
          STOP
        </button>
      )}
      {stage === "stopped" && (
        <div className="flex gap-2">
          <button
            onClick={() => onCapture(Math.round((elapsedMs / 1000) * 100) / 100)}
            className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500"
          >
            Use This Time
          </button>
          <button
            onClick={reset}
            className="rounded-md bg-zinc-700 px-4 py-2 font-semibold text-white hover:bg-zinc-600"
          >
            Redo
          </button>
        </div>
      )}
    </div>
  );
}
