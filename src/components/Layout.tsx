import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Logo, Stripes, Wordmark } from './Brand'
import type { Role } from '../types'
import { fmtDay, fmtHour, ymd } from '../lib/time'

export function RoleSwitch({ compact = false }: { compact?: boolean }) {
  const { s, setRole } = useStore()
  const nav = useNavigate()
  const pick = (r: Role) => {
    setRole(r)
    nav(r === 'musician' ? '/search' : '/parish')
  }
  const opt = (r: Role, label: string) => (
    <button
      key={r}
      onClick={() => pick(r)}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
        s.role === r ? 'bg-ink text-paper shadow' : 'text-ink hover:bg-sand-dark/50'
      }`}
      aria-pressed={s.role === r}
    >
      {label}
    </button>
  )
  return (
    <div className="inline-flex rounded-full bg-sand p-1" role="group" aria-label="Choose your role">
      {opt('musician', 'Musician')}
      {opt('parish', compact ? 'Parish' : 'Parish / Municipality')}
    </div>
  )
}

export function DemoBanner() {
  return (
    <div className="bg-sand text-center text-xs font-medium text-ink/80 py-1 px-3">
      Demo data, for illustration only. Student prototype, no real bookings or payments.
    </div>
  )
}

const musicianNav = [
  { to: '/search', label: 'Search', icon: 'M11 4a7 7 0 1 0 4.2 12.6l4.6 4.6 1.4-1.4-4.6-4.6A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z' },
  { to: '/bookings', label: 'My bookings', icon: 'M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm-2 8h14v10H5V10Z' },
  { to: '/settings', label: 'Settings', icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8.9 2.6-2-.4a7 7 0 0 0-.7-1.6l1.1-1.7-2.2-2.2-1.7 1.1a7 7 0 0 0-1.6-.7l-.4-2h-3.1l-.4 2a7 7 0 0 0-1.6.7L6.6 4.7 4.4 6.9l1.1 1.7a7 7 0 0 0-.7 1.6l-2 .4v3.1l2 .4c.2.6.4 1.1.7 1.6l-1.1 1.7 2.2 2.2 1.7-1.1c.5.3 1 .5 1.6.7l.4 2h3.1l.4-2c.6-.2 1.1-.4 1.6-.7l1.7 1.1 2.2-2.2-1.1-1.7c.3-.5.5-1 .7-1.6l2-.4v-3.1Z' },
]
const parishNav = [
  { to: '/parish', label: 'Parish area', icon: 'M12 2 3 7v2h18V7l-9-5ZM5 11v7H3v3h18v-3h-2v-7h-2v7h-3v-7h-4v7H7v-7H5Z' },
  musicianNav[2],
]

export function Layout() {
  const { s, now, setDemoOffset } = useStore()
  const nav = useNavigate()
  const loc = useLocation()
  useEffect(() => {
    if (!s.role) nav('/', { replace: true })
  }, [s.role, nav])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [loc.pathname])
  const items = s.role === 'parish' ? parishNav : musicianNav
  const d = new Date(now)

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-[1000] bg-paper/95 backdrop-blur border-b border-sand-dark">
        <div className="mx-auto max-w-6xl flex items-center gap-3 px-4 py-2">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="SaintPhonie home">
            <Logo className="h-9 w-9" />
            <Wordmark className="hidden sm:block h-8 w-auto" />
          </Link>
          <nav className="hidden md:flex gap-1 ml-4">
            {items.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`
                }
              >
                {i.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto">
            <RoleSwitch compact />
          </div>
        </div>
        <Stripes />
        <DemoBanner />
        {s.demoOffset !== 0 && (
          <div className="bg-worship text-white text-xs text-center py-1 px-3 flex items-center justify-center gap-3">
            <span>
              Demo clock: {fmtDay(ymd(d))}, {fmtHour(d.getHours() + d.getMinutes() / 60)}
            </span>
            <button className="underline font-semibold" onClick={() => setDemoOffset(0)}>
              Back to real time
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 pt-4 pb-28 md:pb-10">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-[1000] bg-paper/95 backdrop-blur border-t border-sand-dark safe-bottom">
        <div className="flex">
          {items.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${isActive ? 'text-plum' : 'text-muted'}`
              }
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                <path d={i.icon} />
              </svg>
              {i.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
