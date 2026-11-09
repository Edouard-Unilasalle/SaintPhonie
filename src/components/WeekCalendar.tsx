import { bookingsOn, checkSlot, servicesOn, useStore } from '../store'
import type { Church } from '../types'
import { at, fmtDay, fmtHour, fmtRange, nextDays } from '../lib/time'

export interface Slot {
  date: string
  start: number
  end: number
}

const FIRST = 8
const LAST = 22
const ROW = 30

export function WeekCalendar({
  church,
  selection,
  onSelect,
  onMessage,
  readOnly = false,
}: {
  church: Church
  selection?: Slot | null
  onSelect?: (s: Slot | null) => void
  onMessage?: (m: { tone: 'worship' | 'warn'; text: string } | null) => void
  readOnly?: boolean
}) {
  const { s, now } = useStore()
  const days = nextDays(7, now)
  const hours = Array.from({ length: LAST - FIRST }, (_, i) => FIRST + i)

  const click = (date: string, h: number) => {
    if (readOnly || !onSelect) return
    let next: Slot = { date, start: h, end: h + 1 }
    // Tapping a later hour on the same day extends the current selection.
    if (selection && selection.date === date && h >= selection.start && h < selection.start + 4) {
      if (h < selection.end) next = { date, start: h, end: h + 1 }
      else next = { date, start: selection.start, end: h + 1 }
    }
    const r = checkSlot(s, church, date, next.start, next.end, now)
    if (!r.ok) {
      if (r.reason === 'worship') {
        onMessage?.({
          tone: 'worship',
          text: `Reserved for worship: ${r.service.type}, ${fmtRange(r.service.start, r.service.end)}. Worship always comes first, so this slot cannot be booked.`,
        })
      } else {
        onMessage?.({
          tone: 'warn',
          text:
            r.reason === 'booked'
              ? 'Another ensemble has already booked this time.'
              : r.reason === 'past'
                ? 'This time has already passed.'
                : `The parish opens the church from ${fmtHour(church.rules.hours[0])} to ${fmtHour(church.rules.hours[1])}.`,
        })
      }
      return
    }
    onMessage?.(null)
    onSelect(next)
  }

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="min-w-[560px]">
        <div className="grid" style={{ gridTemplateColumns: `44px repeat(7, 1fr)` }}>
          <div />
          {days.map((d, i) => (
            <div key={d} className="text-center text-xs font-semibold pb-1">
              {i === 0 ? 'Today' : fmtDay(d).split(' ').slice(0, 2).join(' ')}
            </div>
          ))}
        </div>
        <div className="grid relative" style={{ gridTemplateColumns: `44px repeat(7, 1fr)` }}>
          <div>
            {hours.map((h) => (
              <div key={h} className="text-[10px] text-muted text-right pr-1.5 -translate-y-1.5" style={{ height: ROW }}>
                {fmtHour(h)}
              </div>
            ))}
          </div>
          {days.map((date) => {
            const svcs = servicesOn(s, church.id, date)
            const bks = bookingsOn(s, church.id, date)
            return (
              <div key={date} className="relative border-l border-sand-dark">
                {hours.map((h) => {
                  const closed = h < church.rules.hours[0] || h >= church.rules.hours[1]
                  const past = at(date, h + 1) <= now
                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={readOnly}
                      onClick={() => click(date, h)}
                      aria-label={`${fmtDay(date)} ${fmtHour(h)}`}
                      className={`block w-full border-b border-sand ${closed || past ? 'hatch bg-sand/60' : 'bg-white hover:bg-gold-light'}`}
                      style={{ height: ROW }}
                    />
                  )
                })}
                {svcs.map((v) => (
                  <div
                    key={v.id}
                    title="Reserved for worship"
                    className="absolute inset-x-0.5 rounded-md bg-worship text-white text-[10px] leading-tight px-1 py-0.5 overflow-hidden pointer-events-auto cursor-not-allowed"
                    style={{ top: (v.start - FIRST) * ROW + 1, height: Math.max((v.end - v.start) * ROW - 2, 16) }}
                    onClick={() => click(date, Math.floor(v.start))}
                  >
                    <span className="font-semibold">{v.type}</span>
                    <span className="hidden sm:inline"> · worship</span>
                  </div>
                ))}
                {bks.map((b) => (
                  <div
                    key={b.id}
                    title={b.byMe ? 'Your booking' : 'Booked by another ensemble'}
                    className={`absolute inset-x-0.5 rounded-md text-[10px] px-1 py-0.5 overflow-hidden ${
                      b.byMe ? 'bg-glass text-white' : 'bg-stone-line/70 text-ink'
                    } ${b.status === 'Pending' ? 'opacity-60 border border-dashed border-ink' : ''}`}
                    style={{ top: (b.start - FIRST) * ROW + 1, height: (b.end - b.start) * ROW - 2 }}
                    onClick={() => click(date, b.start)}
                  >
                    {b.byMe ? 'You' : 'Booked'}
                  </div>
                ))}
                {selection && selection.date === date && (
                  <div
                    className="absolute inset-x-0.5 rounded-md bg-gold/90 ring-2 ring-gold text-[10px] font-bold px-1 py-0.5 pointer-events-none"
                    style={{ top: (selection.start - FIRST) * ROW + 1, height: (selection.end - selection.start) * ROW - 2 }}
                  >
                    {fmtHour(selection.start)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted mt-3">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-worship" /> Reserved for worship
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-stone-line/70" /> Booked
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-glass" /> Your bookings
        </span>
        {!readOnly && (
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-gold" /> Your selection
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded hatch bg-sand" /> Closed or past
        </span>
      </div>
    </div>
  )
}
