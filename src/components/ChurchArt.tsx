import type { ArtVariant } from '../types'

/** Generic church facade illustration. Not a portrait of any real building. */
export function ChurchArt({ variant, className = '', glow = true }: { variant: ArtVariant; className?: string; glow?: boolean }) {
  const stone = '#ece4d4'
  const line = '#8c7f69'
  const roof = '#4a5568'
  const uid = `a${variant}`
  return (
    <svg viewBox="0 0 200 140" className={className} role="img" aria-label="Stylised church facade illustration">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d6ea" />
          <stop offset="1" stopColor="#f6f2ea" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor="#f4d58d" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f4d58d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="140" fill={`url(#${uid}-sky)`} />
      <rect y="128" width="200" height="12" fill="#ddd3c1" />
      {variant === 'gothic' && <Gothic stone={stone} line={line} roof={roof} />}
      {variant === 'spire' && <Spire stone={stone} line={line} roof={roof} />}
      {variant === 'cathedral' && <Cathedral stone={stone} line={line} roof={roof} />}
      {variant === 'romanesque' && <Romanesque stone={stone} line={line} roof={roof} />}
      {variant === 'village' && <Village stone={stone} line={line} roof={roof} />}
      {variant === 'modern' && <Modern stone={stone} line={line} roof={roof} />}
      {glow && <circle cx={rosePos[variant][0]} cy={rosePos[variant][1]} r="22" fill={`url(#${uid}-glow)`} />}
      <Rose cx={rosePos[variant][0]} cy={rosePos[variant][1]} r={rosePos[variant][2]} />
    </svg>
  )
}

const rosePos: Record<ArtVariant, [number, number, number]> = {
  gothic: [100, 72, 11],
  spire: [100, 80, 9],
  cathedral: [100, 70, 12],
  romanesque: [100, 76, 7],
  village: [100, 92, 5],
  modern: [100, 88, 7],
}

type P = { stone: string; line: string; roof: string }

function Rose({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4
    return <circle key={i} cx={cx + Math.cos(a) * r * 0.55} cy={cy + Math.sin(a) * r * 0.55} r={r * 0.36} fill={i % 2 ? '#3d5f9e' : '#6b4c8a'} opacity="0.9" />
  })
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1e3a6e" stroke="#8c7f69" strokeWidth="1.2" />
      {petals}
      <circle cx={cx} cy={cy} r={r * 0.28} fill="#c8963e" />
    </g>
  )
}

function Portal({ x, w, h }: { x: number; w: number; h: number }) {
  return <path d={`M${x} 128 V${128 - h + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${128 - h + w / 2} V128 Z`} fill="#3a3f4f" />
}

function Gothic({ stone, line, roof }: P) {
  return (
    <g stroke={line} strokeWidth="1">
      <rect x="30" y="92" width="30" height="36" fill={stone} />
      <polygon points="30,92 60,78 60,92" fill={roof} />
      <rect x="140" y="92" width="30" height="36" fill={stone} />
      <polygon points="140,78 170,92 140,92" fill={roof} />
      <rect x="86" y="20" width="28" height="40" fill={stone} />
      <polygon points="86,20 100,6 114,20" fill={roof} />
      <rect x="60" y="56" width="80" height="72" fill={stone} />
      <polygon points="60,56 100,30 140,56" fill={stone} />
      <Portal x={88} w={24} h={34} />
      <rect x="66" y="96" width="8" height="22" rx="4" fill="#3d5f9e" />
      <rect x="126" y="96" width="8" height="22" rx="4" fill="#3d5f9e" />
    </g>
  )
}

function Spire({ stone, line, roof }: P) {
  return (
    <g stroke={line} strokeWidth="1">
      <rect x="40" y="88" width="120" height="40" fill={stone} />
      <polygon points="40,88 100,70 160,88" fill={roof} />
      <rect x="88" y="44" width="24" height="44" fill={stone} />
      <polygon points="88,44 100,2 112,44" fill={roof} />
      <rect x="64" y="66" width="72" height="62" fill={stone} />
      <polygon points="64,66 100,44 136,66" fill={stone} />
      <Portal x={90} w={20} h={30} />
      <rect x="50" y="98" width="7" height="20" rx="3.5" fill="#3d5f9e" />
      <rect x="143" y="98" width="7" height="20" rx="3.5" fill="#3d5f9e" />
    </g>
  )
}

function Cathedral({ stone, line, roof }: P) {
  return (
    <g stroke={line} strokeWidth="1">
      <rect x="22" y="40" width="34" height="88" fill={stone} />
      <rect x="144" y="40" width="34" height="88" fill={stone} />
      <polygon points="22,40 39,28 56,40" fill={roof} />
      <polygon points="144,40 161,28 178,40" fill={roof} />
      <polygon points="92,30 100,0 108,30" fill={roof} />
      <rect x="56" y="50" width="88" height="78" fill={stone} />
      <polygon points="56,50 100,26 144,50" fill={stone} />
      <Portal x={88} w={24} h={36} />
      <Portal x={62} w={14} h={24} />
      <Portal x={124} w={14} h={24} />
    </g>
  )
}

function Romanesque({ stone, line, roof }: P) {
  return (
    <g stroke={line} strokeWidth="1">
      <rect x="36" y="90" width="128" height="38" fill={stone} />
      <polygon points="36,90 100,76 164,90" fill={roof} />
      <rect x="84" y="30" width="32" height="40" fill={stone} />
      <polygon points="84,30 100,14 116,30" fill={roof} />
      <rect x="92" y="40" width="5" height="10" rx="2.5" fill="#3a3f4f" />
      <rect x="103" y="40" width="5" height="10" rx="2.5" fill="#3a3f4f" />
      <rect x="66" y="62" width="68" height="66" fill={stone} />
      <polygon points="66,62 100,48 134,62" fill={stone} />
      <Portal x={90} w={20} h={28} />
      <rect x="74" y="88" width="6" height="14" rx="3" fill="#3d5f9e" />
      <rect x="120" y="88" width="6" height="14" rx="3" fill="#3d5f9e" />
    </g>
  )
}

function Village({ stone, line, roof }: P) {
  return (
    <g stroke={line} strokeWidth="1">
      <rect x="70" y="96" width="100" height="32" fill={stone} />
      <polygon points="70,96 120,80 170,96" fill={roof} />
      <rect x="86" y="62" width="28" height="66" fill={stone} />
      <polygon points="86,62 100,14 114,62" fill={roof} />
      <Portal x={93} w={14} h={22} />
      <rect x="130" y="104" width="6" height="12" rx="3" fill="#3d5f9e" />
      <rect x="150" y="104" width="6" height="12" rx="3" fill="#3d5f9e" />
      <circle cx="40" cy="112" r="14" fill="#9fb48c" stroke="none" />
      <rect x="38" y="118" width="4" height="10" fill="#7a6a52" stroke="none" />
    </g>
  )
}

function Modern({ stone, line, roof }: P) {
  return (
    <g stroke={line} strokeWidth="1">
      <path d="M20 128 C 40 70, 80 60, 100 30 C 120 60, 160 70, 180 128 Z" fill={roof} />
      <path d="M38 128 C 55 90, 85 82, 100 56 C 115 82, 145 90, 162 128 Z" fill={stone} />
      <path d="M100 30 L 104 4 L 108 34" fill="none" stroke={roof} strokeWidth="2" />
      <rect x="70" y="104" width="60" height="24" fill="#3d5f9e" opacity="0.8" />
      <line x1="85" y1="104" x2="85" y2="128" />
      <line x1="100" y1="104" x2="100" y2="128" />
      <line x1="115" y1="104" x2="115" y2="128" />
    </g>
  )
}

/** Small rose window used as logo. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#1e3a6e" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        return <circle key={i} cx={20 + Math.cos(a) * 10} cy={20 + Math.sin(a) * 10} r="6" fill={i % 2 ? '#3d5f9e' : '#6b4c8a'} />
      })}
      <circle cx="20" cy="20" r="5.5" fill="#c8963e" />
    </svg>
  )
}
