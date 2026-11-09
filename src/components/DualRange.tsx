import { REVERB_MARKS } from '../data/churches'

export const RT_MIN = 1
export const RT_MAX = 9

export function DualRange({ value, onChange }: { value: [number, number]; onChange: (v: [number, number]) => void }) {
  const [lo, hi] = value
  const pct = (v: number) => ((v - RT_MIN) / (RT_MAX - RT_MIN)) * 100
  return (
    <div>
      <div className="dual">
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-1.5 rounded-full bg-sand-dark" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-glass"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          min={RT_MIN}
          max={RT_MAX}
          step={0.1}
          value={lo}
          aria-label="Minimum reverberation in seconds"
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - 0.5), hi])}
        />
        <input
          type="range"
          min={RT_MIN}
          max={RT_MAX}
          step={0.1}
          value={hi}
          aria-label="Maximum reverberation in seconds"
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + 0.5)])}
        />
      </div>
      <div className="relative h-8 mt-1 text-[11px] text-muted">
        {REVERB_MARKS.map((m) => (
          <button
            key={m.label}
            type="button"
            className="absolute -translate-x-1/2 flex flex-col items-center hover:text-glass"
            style={{ left: `${pct(m.value)}%` }}
            onClick={() => onChange([Math.max(RT_MIN, m.value - 1), Math.min(RT_MAX, m.value + 1)])}
            title={`Show churches around ${m.value} s`}
          >
            <span className="h-1.5 w-px bg-stone-line" />
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
