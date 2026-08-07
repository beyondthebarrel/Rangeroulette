export function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="h-7 w-7 rounded bg-zinc-700 text-white hover:bg-zinc-600"
        >
          −
        </button>
        <span className="w-5 text-center font-mono text-white">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="h-7 w-7 rounded bg-zinc-700 text-white hover:bg-zinc-600"
        >
          +
        </button>
      </div>
    </div>
  );
}
