import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { BRAND_COLORS, ClefOval, Logo, Wordmark } from '../components/Brand'
import { DemoBanner } from '../components/Layout'
import type { Role } from '../types'

export default function Home() {
  const { s, setRole } = useStore()
  const nav = useNavigate()
  const go = (r: Role) => {
    setRole(r)
    nav(r === 'musician' ? '/search' : '/parish')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-ink">
      <DemoBanner />

      {/* Cream top, with the colour bands on the right as on the brand board */}
      <section className="relative bg-paper overflow-hidden">
        <div className="absolute inset-y-0 right-0 hidden md:flex w-[46%]" aria-hidden="true">
          {BRAND_COLORS.map((c) => (
            <span key={c} className="flex-1" style={{ background: c }} />
          ))}
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-24 md:pb-32">
          <div className="md:w-[50%]">
            <p className="eyebrow text-muted flex items-center gap-2">
              <Logo className="h-6 w-6" /> Rouen pilot
            </p>
            <Wordmark className="mt-5 w-full max-w-[460px] h-auto" />
            <p className="mt-5 text-xl md:text-2xl font-semibold tracking-tight">
              Book an empty church. Play in extraordinary acoustics.
            </p>
            <div className="mt-6 flex gap-3 md:gap-5">
              {BRAND_COLORS.filter((_, i) => i !== 2).map((c) => (
                <ClefOval key={c} color={c} className="h-20 md:h-28" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Black lower part with a curved edge */}
      <section className="relative flex-1 bg-ink text-paper">
        <svg className="absolute -top-16 md:-top-24 left-0 w-full h-16 md:h-24" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 10 C 20 -2, 55 -2, 74 8 C 82 4, 92 4, 100 6 L 100 10 Z" fill="#121212" />
        </svg>
        <div className="relative mx-auto max-w-6xl px-4 pb-10 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-paper text-3xl md:text-5xl font-medium uppercase leading-[1.15] tracking-[0.18em]">
              Giving forgotten places a new voice.
            </h1>
            <div className="mt-6 border-l-4 border-sage pl-4">
              <p className="text-lg font-semibold">Musicians need great acoustics.</p>
              <p className="text-lg font-semibold">Churches stand empty all week.</p>
              <p className="mt-2 text-paper/70">
                SaintPhonie connects the two. Each booking respects worship, follows the parish rules and funds the upkeep of the
                building.
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow text-paper/60 mb-3">Who are you?</p>
            <div className="grid gap-3">
              <RoleCard
                active={s.role === 'musician'}
                color="#b8d895"
                title="Musician"
                text="Find a church, listen to it, book a slot."
                onClick={() => go('musician')}
              />
              <RoleCard
                active={s.role === 'parish'}
                color="#8799c6"
                title="Parish / Municipality"
                text="Approve requests, set rules, follow the upkeep fund."
                onClick={() => go('parish')}
              />
            </div>
            <p className="mt-3 text-xs text-paper/50">You can switch role at any time from the top bar.</p>
          </div>
        </div>
        <footer className="text-center text-xs text-paper/40 pb-6 px-4">
          Student prototype, UniLaSalle Rouen. Not affiliated with any diocese, municipality or company.
        </footer>
      </section>
    </div>
  )
}

function RoleCard({ active, color, title, text, onClick }: { active: boolean; color: string; title: string; text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-4 rounded-2xl p-4 text-left text-ink transition hover:-translate-y-0.5 ${active ? 'ring-4 ring-paper/40' : ''}`}
      style={{ background: color }}
    >
      <ClefOval color="#121212" className="h-14 shrink-0" />
      <span className="flex-1">
        <span className="block text-xl font-extrabold tracking-tight">{title}</span>
        <span className="block text-sm text-ink/75">{text}</span>
      </span>
      <span className="text-2xl transition group-hover:translate-x-1" aria-hidden="true">
        →
      </span>
    </button>
  )
}
