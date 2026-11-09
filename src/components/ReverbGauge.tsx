import { REVERB_MARKS } from '../data/churches'

/** Half-circle gauge from 0 to 9 seconds. */
export function ReverbGauge({ value }: { value: number }) {
  const max = 9
  const angle = (v: number) => Math.PI * (1 - Math.min(v, max) / max)
  const pt = (v: number, r: number) => [100 + Math.cos(angle(v)) * r, 100 - Math.sin(angle(v)) * r]
  const arc = (a: number, b: number, r: number) => {
    const [x1, y1] = pt(a, r)
    const [x2, y2] = pt(b, r)
    return `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`
  }
  const [nx, ny] = pt(value, 70)
  const zones = [
    [0, 2.5, '#e4e8f3'],
    [2.5, 4, '#c3cde6'],
    [4, 6, '#8799c6'],
    [6, 9, '#4f5f8f'],
  ] as const
  return (
    <svg viewBox="0 -12 200 130" className="w-full max-w-64" role="img" aria-label={`Reverberation time ${value.toFixed(1)} seconds`}>
      {zones.map(([a, b, c]) => (
        <path key={a} d={arc(a, b, 80)} stroke={c} strokeWidth="18" fill="none" />
      ))}
      {REVERB_MARKS.map((m) => {
        const [x, y] = pt(m.value, 100)
        return (
          <text key={m.label} x={x} y={y + 4} fontSize="8.5" textAnchor="middle" fill="#5c5c5c">
            {m.label}
          </text>
        )
      })}
      <line x1="100" y1="100" x2={nx} y2={ny} stroke="#7d0f43" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="100" r="7" fill="#121212" />
      <text x="100" y="80" fontSize="20" fontWeight="700" textAnchor="middle" fill="#121212">
        {value.toFixed(1)} s
      </text>
      <text x="22" y="115" fontSize="8" fill="#5c5c5c" textAnchor="middle">0 s</text>
      <text x="178" y="115" fontSize="8" fill="#5c5c5c" textAnchor="middle">9 s</text>
    </svg>
  )
}
