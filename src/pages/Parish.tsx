import { useEffect, useRef, useState } from 'react'
import { displayStatus, maintenanceShare, servicesOn, useStore } from '../store'
import { useAnimated } from '../components/AnimatedNumber'
import { WeekCalendar } from '../components/WeekCalendar'
import { STATUS_STYLE } from './MyBookings'
import { STYLES, type ServiceType } from '../types'
import { addDays, at, euro, fmtDay, fmtHour, fmtRange, nextDays, overlaps, weekdayOf, WEEKDAYS_LONG } from '../lib/time'

export default function Parish() {
  const { s, now, church, decide, setParishChurch } = useStore()
  const c = church(s.parishChurchId)!
  const pending = s.bookings.filter((b) => b.status === 'Pending').sort((a, b) => a.createdAt - b.createdAt)
  const recent = s.bookings
    .filter((b) => b.churchId === c.id && b.status !== 'Pending')
    .sort((a, b) => at(b.date, b.start) - at(a.date, a.start))
    .slice(0, 5)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Parish / Municipality area</p>
          <h1 className="text-3xl font-semibold">{c.name}</h1>
        </div>
        <label className="min-w-64">
          <span className="label">Church you manage</span>
          <select className="field" value={c.id} onChange={(e) => setParishChurch(e.target.value)}>
            {s.churches
              .filter((x) => x.available)
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}, {x.town}
                </option>
              ))}
          </select>
        </label>
      </div>
      <p className="text-xs text-warn bg-warn-light rounded-lg px-3 py-2">
        Demo data: requests, services, revenue and funds are fictional and for illustration only.
      </p>

      <Impact key={c.id} churchId={c.id} />

      <section className="card p-5">
        <h2 className="text-2xl font-semibold">Requests awaiting approval</h2>
        <p className="text-sm text-muted">The parish keeps a veto on every use outside its charter.</p>
        <div className="mt-3 space-y-3">
          {pending.length === 0 && <p className="text-muted">No pending request. All caught up.</p>}
          {pending.map((b) => {
            const bc = church(b.churchId)!
            const allowed = bc.rules.allowedStyles.includes(b.repertoire)
            return (
              <div key={b.id} className="rounded-xl border border-sand-dark p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold">
                    {b.ensembleName} <span className="text-muted font-normal">· {b.ensemble}, {b.musicians} musicians</span>
                  </p>
                  <p className="text-sm">
                    {bc.name}, {fmtDay(b.date)}, {fmtRange(b.start, b.end)}
                  </p>
                  <p className="text-sm mt-1 flex flex-wrap gap-1">
                    <span className={`chip ${allowed ? '!bg-ok-light !text-ok' : '!bg-warn-light !text-warn'}`}>{b.repertoire}</span>
                    {!allowed && <span className="chip !bg-warn-light !text-warn">Not in charter</span>}
                    {b.useOrgan && <span className="chip !bg-warn-light !text-warn">Organ requested</span>}
                    {b.byMe && <span className="chip !bg-glass-light !text-glass">From the demo musician</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-ghost !py-2" onClick={() => decide(b.id, false)}>
                    Decline
                  </button>
                  <button
                    className="btn btn-primary !py-2"
                    onClick={() => {
                      setParishChurch(b.churchId)
                      decide(b.id, true)
                    }}
                  >
                    Approve
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-5">
        <Charter />
        <section className="card p-5">
          <h2 className="text-2xl font-semibold">Latest bookings</h2>
          <ul className="mt-2 divide-y divide-sand">
            {recent.map((b) => {
              const st = displayStatus(b, now)
              return (
                <li key={b.id} className="py-2 flex items-center gap-2 text-sm">
                  <div className="flex-1">
                    <p className="font-semibold">{b.ensembleName}</p>
                    <p className="text-muted">
                      {fmtDay(b.date)}, {fmtRange(b.start, b.end)} · {b.repertoire}
                    </p>
                  </div>
                  <span className={`chip ${STATUS_STYLE[st]}`}>{st}</span>
                </li>
              )
            })}
            {recent.length === 0 && <li className="py-2 text-muted text-sm">No booking yet for this church.</li>}
          </ul>
        </section>
      </div>

      <Services />
    </div>
  )
}

function Impact({ churchId }: { churchId: string }) {
  const { s, markFundSeen } = useStore()
  const f = s.funds[churchId]
  const confirmed = s.bookings.filter((b) => b.churchId === churchId && b.status === 'Confirmed')
  const hours = f.hoursBase + confirmed.reduce((a, b) => a + (b.end - b.start), 0)
  const revenue = f.revenueBase + confirmed.reduce((a, b) => a + b.price, 0)
  const initial = useRef(f.lastSeen)
  const delta = f.raised - initial.current
  const raised = useAnimated(f.raised, f.lastSeen)
  const pct = Math.min(100, (raised / f.target) * 100)

  const markRef = useRef(markFundSeen)
  markRef.current = markFundSeen
  useEffect(() => {
    if (f.raised === f.lastSeen) return
    const t = setTimeout(() => markRef.current(churchId), 2400)
    return () => clearTimeout(t)
  }, [f.raised, f.lastSeen, churchId])

  return (
    <section className="card p-5">
      <h2 className="text-2xl font-semibold">Impact dashboard</h2>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="Hours of music this year" value={`${hours} h`} />
        <Tile label="Revenue generated" value={euro(Math.round(revenue))} />
        <Tile label="Bookings confirmed" value={String(confirmed.length + Math.round(f.hoursBase / 2))} />
        <Tile label="Share to upkeep" value="25%" />
      </div>

      <div className="mt-5 rounded-2xl bg-linear-to-br from-glass to-glass-dark text-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-sm text-white/75">Maintenance fund</p>
            <p className="font-serif text-2xl font-semibold">Goal: {f.goal}</p>
          </div>
          {delta > 0 && (
            <span className="chip !bg-gold !text-ink !text-sm animate-bounce">+{euro(delta)} from new bookings</span>
          )}
        </div>
        <p className="mt-3 font-mono text-4xl md:text-5xl font-bold text-gold tabular-nums">{euro(Math.round(raised * 100) / 100)}</p>
        <p className="text-sm text-white/75">raised of {euro(f.target)}</p>
        <div className="mt-3 h-5 rounded-full bg-white/15 overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-linear-to-r from-lavender via-coral to-sage" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm text-white/80">
          {pct.toFixed(1)}% of the goal. Each hour booked here adds {euro(maintenanceShare(s.churches.find((c) => c.id === churchId)!.pricePerHour))} to
          the fund.
        </p>
      </div>
    </section>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-sand p-3">
      <p className="text-2xl font-semibold text-glass">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}

function Charter() {
  const { s, church, toggleStyle } = useStore()
  const c = church(s.parishChurchId)!
  return (
    <section className="card p-5">
      <h2 className="text-2xl font-semibold">Charter of authorised uses</h2>
      <p className="text-sm text-muted">Styles switched on are confirmed instantly. Others come to you for approval.</p>
      <ul className="mt-3 divide-y divide-sand">
        {STYLES.map((st) => {
          const on = c.rules.allowedStyles.includes(st)
          return (
            <li key={st} className="flex items-center justify-between py-2">
              <span className={on ? 'font-medium' : 'text-muted'}>{st}</span>
              <button
                role="switch"
                aria-checked={on}
                aria-label={`Allow ${st}`}
                onClick={() => toggleStyle(c.id, st)}
                className={`relative h-7 w-12 rounded-full transition ${on ? 'bg-ok' : 'bg-sand-dark'}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Services() {
  const { s, now, church, addService, removeService } = useStore()
  const c = church(s.parishChurchId)!
  const days = nextDays(14, now)
  const [type, setType] = useState<ServiceType>('Mass')
  const [when, setWhen] = useState<string>(days[1])
  const [start, setStart] = useState(18)
  const [dur, setDur] = useState(1)

  const recurring = s.services.filter((v) => v.churchId === c.id && v.weekday !== undefined).sort((a, b) => a.weekday! - b.weekday! || a.start - b.start)
  const oneOff = s.services
    .filter((v) => v.churchId === c.id && v.date && v.date >= days[0] && v.date <= days[13])
    .sort((a, b) => a.date!.localeCompare(b.date!))

  // Warn if the new service would overlap confirmed bookings.
  const targetDates = when.startsWith('w') ? days.filter((d) => weekdayOf(d) === Number(when.slice(1))) : [when]
  const clashes = s.bookings.filter(
    (b) => b.churchId === c.id && b.status !== 'Declined' && targetDates.includes(b.date) && overlaps(start, start + dur, b.start, b.end),
  )

  const add = () =>
    addService({
      churchId: c.id,
      type,
      start,
      end: start + dur,
      ...(when.startsWith('w') ? { weekday: Number(when.slice(1)) } : { date: when }),
    })

  return (
    <section className="card p-5">
      <h2 className="text-2xl font-semibold">Services and calendar</h2>
      <p className="text-sm text-muted">Worship always comes first. Adding a service blocks the slot for musicians immediately.</p>

      <div className="mt-4 grid lg:grid-cols-[1fr_1.4fr] gap-5">
        <div className="space-y-4">
          <div className="rounded-xl bg-worship-light p-4 space-y-3">
            <p className="font-semibold text-worship">Add a service</p>
            <div className="grid grid-cols-2 gap-2">
              <label>
                <span className="label">Type</span>
                <select className="field" value={type} onChange={(e) => setType(e.target.value as ServiceType)}>
                  {(['Mass', 'Wedding', 'Funeral', 'Vespers'] as const).map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">When</span>
                <select className="field" value={when} onChange={(e) => setWhen(e.target.value)}>
                  <optgroup label="One date">
                    {days.map((d, i) => (
                      <option key={d} value={d}>
                        {i === 0 ? 'Today' : fmtDay(d)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Every week">
                    {WEEKDAYS_LONG.map((w, i) => (
                      <option key={w} value={`w${i}`}>
                        Every {w}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>
              <label>
                <span className="label">Start</span>
                <select className="field" value={start} onChange={(e) => setStart(Number(e.target.value))}>
                  {Array.from({ length: 29 }, (_, i) => 7 + i / 2).map((h) => (
                    <option key={h} value={h}>
                      {fmtHour(h)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">Duration</span>
                <select className="field" value={dur} onChange={(e) => setDur(Number(e.target.value))}>
                  {[0.75, 1, 1.5, 2].map((d) => (
                    <option key={d} value={d}>
                      {d * 60} min
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {clashes.length > 0 && (
              <p className="text-xs text-warn">
                Overlaps {clashes.length} booking{clashes.length > 1 ? 's' : ''}: the musicians would be notified and offered another slot or a full
                refund (simulated).
              </p>
            )}
            <button className="btn bg-worship text-white w-full" onClick={add}>
              Add and block the slot
            </button>
          </div>

          <div>
            <p className="font-semibold mb-1">Every week</p>
            <ul className="space-y-1">
              {recurring.map((v) => (
                <ServiceRow key={v.id} label={`${WEEKDAYS_LONG[v.weekday!]}, ${fmtRange(v.start, v.end)}`} type={v.type} onRemove={() => removeService(v.id)} />
              ))}
            </ul>
            <p className="font-semibold mt-3 mb-1">Next two weeks</p>
            <ul className="space-y-1">
              {oneOff.length === 0 && <li className="text-sm text-muted">No wedding or funeral planned.</li>}
              {oneOff.map((v) => (
                <ServiceRow key={v.id} label={`${fmtDay(v.date!)}, ${fmtRange(v.start, v.end)}`} type={v.type} onRemove={() => removeService(v.id)} />
              ))}
            </ul>
          </div>
        </div>

        <div>
          <p className="font-semibold mb-2">What musicians see this week</p>
          <WeekCalendar church={c} readOnly />
          <p className="text-xs text-muted mt-2">
            Today: {servicesOn(s, c.id, days[0]).length} service(s). Tomorrow: {servicesOn(s, c.id, addDays(days[0], 1)).length} service(s).
          </p>
        </div>
      </div>
    </section>
  )
}

function ServiceRow({ label, type, onRemove }: { label: string; type: string; onRemove: () => void }) {
  return (
    <li className="flex items-center gap-2 rounded-lg bg-white border border-sand-dark px-3 py-1.5 text-sm">
      <span className="h-2.5 w-2.5 rounded-full bg-worship" />
      <span className="font-semibold">{type}</span>
      <span className="text-muted">{label}</span>
      <button className="ml-auto text-danger text-xs font-semibold hover:underline" onClick={onRemove} aria-label={`Remove ${type} ${label}`}>
        Remove
      </button>
    </li>
  )
}
