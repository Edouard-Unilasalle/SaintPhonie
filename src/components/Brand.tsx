import wordmarkUrl from '../assets/wordmark.png'
import clefUrl from '../assets/clef.png'

export const BRAND_COLORS = ['#8799c6', '#7d0f43', '#e07673', '#b8d895'] as const

/** "SAINT PHONIE" wordmark from the brand board. `light` renders it cream for dark backgrounds. */
export function Wordmark({ className = '', light = false }: { className?: string; light?: boolean }) {
  return (
    <img
      src={wordmarkUrl}
      alt="SaintPhonie"
      className={className}
      style={light ? { filter: 'invert(0.96)' } : undefined}
      draggable={false}
    />
  )
}

/** The treble clef with notes, painted in the current text colour. */
export function Clef({ className = '' }: { className?: string }) {
  const mask = `url(${clefUrl}) center / contain no-repeat`
  return <span aria-hidden="true" className={`inline-block bg-current ${className}`} style={{ mask, WebkitMask: mask }} />
}

/** App mark: cream clef on a black rounded square, like the app icon. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-[22%] bg-ink text-paper ${className}`} aria-hidden="true">
      <Clef className="h-[72%] w-[72%]" />
    </span>
  )
}

/** Oval badge with the clef, in one of the brand colours. */
export function ClefOval({ color, className = '' }: { color: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[50%] text-paper ${className}`}
      style={{ background: color, aspectRatio: '0.77' }}
      aria-hidden="true"
    >
      <Clef className="h-[72%] w-[60%]" />
    </span>
  )
}

/** The four colour bands of the brand board. */
export function Stripes({ className = '' }: { className?: string }) {
  return (
    <div className={`stripes ${className}`} aria-hidden="true">
      {BRAND_COLORS.map((c) => (
        <span key={c} style={{ background: c }} />
      ))}
    </div>
  )
}
