export default function ProgressBar({ current, total, label }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="font-bold text-pokemon-yellow">{current}/{total} — {pct}%</span>
      </div>
      <div className="h-3 bg-pokemon-dark rounded-full overflow-hidden border border-pokemon-border">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? 'linear-gradient(90deg, #FFDE00, #FFB800)'
              : 'linear-gradient(90deg, #3B5BA5, #FFDE00)',
          }}
        >
          <span className="absolute inset-0 bg-shimmer-gradient animate-shimmer bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
}
