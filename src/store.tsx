import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Booking, Church, DisplayStatus, Role, Service, State, Style } from './types'
import { buildSeed, randomCode, STATE_VERSION } from './data/seed'
import { at, overlaps, weekdayOf } from './lib/time'

const KEY = 'saint-glinglin-demo'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as State
      if (s.version === STATE_VERSION) return s
    }
  } catch {
    /* storage unavailable: fall back to seed */
  }
  return buildSeed()
}

/* ---------- Pure helpers ---------- */

export const SPLIT = [
  { key: 'municipality', label: 'Municipality fee', pct: 0.4, color: 'var(--color-glass)' },
  { key: 'parish', label: 'Parish share', pct: 0.2, color: 'var(--color-worship)' },
  { key: 'maintenance', label: 'Maintenance fund', pct: 0.25, color: 'var(--color-gold)' },
  { key: 'platform', label: 'Platform commission', pct: 0.15, color: 'var(--color-muted)' },
] as const

export const maintenanceShare = (price: number) => Math.round(price * 0.25 * 100) / 100

export function servicesOn(s: State, churchId: string, date: string): Service[] {
  const wd = weekdayOf(date)
  return s.services
    .filter((v) => v.churchId === churchId && (v.date === date || (v.date === undefined && v.weekday === wd)))
    .sort((a, b) => a.start - b.start)
}

export function bookingsOn(s: State, churchId: string, date: string): Booking[] {
  return s.bookings.filter((b) => b.churchId === churchId && b.date === date && b.status !== 'Declined')
}

export type SlotCheck =
  | { ok: true }
  | { ok: false; reason: 'worship'; service: Service }
  | { ok: false; reason: 'booked' | 'past' | 'closed' }

export function checkSlot(s: State, church: Church, date: string, start: number, end: number, now: number): SlotCheck {
  const svc = servicesOn(s, church.id, date).find((v) => overlaps(start, end, v.start, v.end))
  if (svc) return { ok: false, reason: 'worship', service: svc }
  if (start < church.rules.hours[0] || end > church.rules.hours[1]) return { ok: false, reason: 'closed' }
  if (at(date, end) <= now) return { ok: false, reason: 'past' }
  if (bookingsOn(s, church.id, date).some((b) => overlaps(start, end, b.start, b.end))) return { ok: false, reason: 'booked' }
  return { ok: true }
}

export function displayStatus(b: Booking, now: number): DisplayStatus {
  if (b.status === 'Pending') return 'Pending parish approval'
  if (b.status === 'Declined') return 'Declined'
  return at(b.date, b.end) <= now ? 'Completed' : 'Confirmed'
}

export function needsApproval(church: Church, repertoire: Style, useOrgan: boolean): string[] {
  const why: string[] = []
  if (!church.rules.allowedStyles.includes(repertoire)) why.push(`"${repertoire}" is not yet in this parish's charter of authorised uses.`)
  if (useOrgan) why.push('Organ use needs the agreement of the organist.')
  return why
}

/* ---------- Store ---------- */

export interface NewBooking {
  churchId: string
  date: string
  start: number
  end: number
  ensemble: string
  ensembleName: string
  musicians: number
  repertoire: Style
  useOrgan: boolean
  signature: string
}

interface Store {
  s: State
  now: number
  church: (id: string) => Church | undefined
  setRole: (r: Role) => void
  addBooking: (b: NewBooking) => Booking
  decide: (id: string, approve: boolean) => void
  review: (id: string, rating: number, text: string) => void
  toggleStyle: (churchId: string, style: Style) => void
  addService: (v: Omit<Service, 'id'>) => void
  removeService: (id: string) => void
  setParishChurch: (id: string) => void
  markFundSeen: (id: string) => void
  setDemoOffset: (ms: number) => void
  reset: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(load)
  const [tick, setTick] = useState(Date.now())

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
      /* quota or private mode: the demo still works in memory */
    }
  }, [s])

  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const now = tick + s.demoOffset
  const up = useCallback((f: (p: State) => State) => setS(f), [])

  const addFund = (p: State, churchId: string, amount: number): State['funds'] => {
    const f = p.funds[churchId]
    if (!f) return p.funds
    return { ...p.funds, [churchId]: { ...f, raised: Math.round((f.raised + amount) * 100) / 100 } }
  }

  const store = useMemo<Store>(() => {
    const church = (id: string) => s.churches.find((c) => c.id === id)
    return {
      s,
      now,
      church,
      setRole: (role) => up((p) => ({ ...p, role })),
      addBooking: (nb) => {
        const c = church(nb.churchId)!
        const pending = needsApproval(c, nb.repertoire, nb.useOrgan).length > 0
        const booking: Booking = {
          ...nb,
          id: `bk-${Date.now().toString(36)}`,
          status: pending ? 'Pending' : 'Confirmed',
          code: randomCode(),
          byMe: true,
          price: c.pricePerHour * (nb.end - nb.start),
          createdAt: Date.now(),
        }
        up((p) => ({
          ...p,
          bookings: [...p.bookings, booking],
          parishChurchId: nb.churchId,
          funds: pending ? p.funds : addFund(p, nb.churchId, maintenanceShare(booking.price)),
        }))
        return booking
      },
      decide: (id, approve) =>
        up((p) => {
          const b = p.bookings.find((x) => x.id === id)
          if (!b || b.status !== 'Pending') return p
          return {
            ...p,
            bookings: p.bookings.map((x) => (x.id === id ? { ...x, status: approve ? 'Confirmed' : 'Declined' } : x)),
            funds: approve ? addFund(p, b.churchId, maintenanceShare(b.price)) : p.funds,
          }
        }),
      review: (id, rating, text) =>
        up((p) => ({
          ...p,
          bookings: p.bookings.map((x) => (x.id === id ? { ...x, review: { rating, text, author: x.ensembleName } } : x)),
        })),
      toggleStyle: (churchId, style) =>
        up((p) => ({
          ...p,
          churches: p.churches.map((c) => {
            if (c.id !== churchId) return c
            const has = c.rules.allowedStyles.includes(style)
            const allowedStyles = has ? c.rules.allowedStyles.filter((x) => x !== style) : [...c.rules.allowedStyles, style]
            return { ...c, rules: { ...c.rules, allowedStyles } }
          }),
        })),
      addService: (v) => up((p) => ({ ...p, services: [...p.services, { ...v, id: `svc-${Date.now().toString(36)}` }] })),
      removeService: (id) => up((p) => ({ ...p, services: p.services.filter((v) => v.id !== id) })),
      setParishChurch: (id) => up((p) => ({ ...p, parishChurchId: id })),
      markFundSeen: (id) =>
        up((p) => (p.funds[id] ? { ...p, funds: { ...p.funds, [id]: { ...p.funds[id], lastSeen: p.funds[id].raised } } } : p)),
      setDemoOffset: (ms) => up((p) => ({ ...p, demoOffset: ms })),
      reset: () => {
        const role = s.role
        setS({ ...buildSeed(), role })
      },
    }
  }, [s, now, up])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore outside provider')
  return v
}
