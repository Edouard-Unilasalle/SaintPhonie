import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { ChurchArt, Logo } from '../components/ChurchArt'
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
    <div className="min-h-dvh flex flex-col">
      <DemoBanner />
      <div className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 md:py-14 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Logo className="h-12 w-12" />
            <span className="text-sm font-semibold tracking-widest uppercase text-muted">Rouen pilot</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold text-glass">Saint-Glinglin</h1>
          <p className="mt-3 text-xl md:text-2xl font-serif text-ink">
            Book an empty church. Play in extraordinary acoustics.
          </p>

          <div className="mt-6 card p-5 border-l-4 border-l-gold">
            <p className="text-lg font-semibold">Musicians need great acoustics.</p>
            <p className="text-lg font-semibold">Churches stand empty all week.</p>
            <p className="mt-2 text-muted">
              Saint-Glinglin connects the two. Each booking respects worship, follows the parish rules and funds the upkeep of
              the building.
            </p>
          </div>

          <p className="mt-4 text-sm text-muted italic">
            In French, "à la Saint-Glinglin" means "never": a saint's day that does not exist. We turn never into every day of
            the week.
          </p>
        </div>

        <div>
          <ChurchArt variant="gothic" className="w-full rounded-2xl border border-sand-dark shadow-sm" />
          <p className="mt-6 mb-3 font-semibold text-center">Who are you?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => go('musician')}
              className={`card p-4 text-left hover:border-glass transition ${s.role === 'musician' ? 'ring-2 ring-glass' : ''}`}
            >
              <span className="text-2xl" aria-hidden="true">🎻</span>
              <span className="block mt-1 font-serif text-lg font-semibold">Musician</span>
              <span className="block text-sm text-muted">Find a church, listen to it, book a slot.</span>
            </button>
            <button
              onClick={() => go('parish')}
              className={`card p-4 text-left hover:border-glass transition ${s.role === 'parish' ? 'ring-2 ring-glass' : ''}`}
            >
              <span className="text-2xl" aria-hidden="true">🏛️</span>
              <span className="block mt-1 font-serif text-lg font-semibold">Parish / Municipality</span>
              <span className="block text-sm text-muted">Approve requests, set rules, follow the upkeep fund.</span>
            </button>
          </div>
          <p className="mt-3 text-xs text-center text-muted">You can switch role at any time from the top bar.</p>
        </div>
      </div>
      <footer className="text-center text-xs text-muted pb-6 px-4">
        Student prototype, UniLaSalle Rouen. Not affiliated with any diocese, municipality or company.
      </footer>
    </div>
  )
}
