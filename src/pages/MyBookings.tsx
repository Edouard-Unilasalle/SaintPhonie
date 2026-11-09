import { useState } from 'react'
import { Link } from 'react-router-dom'
import { displayStatus, useStore } from '../store'
import type { Booking, DisplayStatus } from '../types'
import { at, euro, fmtDay, fmtRange } from '../lib/time'

export const STATUS_STYLE: Record<DisplayStatus, string> = {
  Confirmed: 'bg-ok-light text-ok',
  'Pending parish approval': 'bg-warn-light text-warn',
  Declined: 'bg-sand text-muted line-through',
  Completed: 'bg-glass-light text-glass',
}

export default function MyBookings() {
  const { s, now } = useStore()
  const mine = s.bookings.filter((b) => b.byMe).sort((a, b) => at(b.date, b.start) - at(a.date, a.start))
  const upcoming = mine.filter((b) => displayStatus(b, now) !== 'Completed')
  const past = mine.filter((b) => displayStatus(b, now) === 'Completed')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold">My bookings</h1>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-muted">Upcoming</h2>
        {upcoming.length === 0 && <p className="text-muted">No upcoming booking yet.</p>}
        {upcoming.map((b) => (
          <Row key={b.id} b={b} />
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-muted">Completed</h2>
        {past.map((b) => (
          <Row key={b.id} b={b} />
        ))}
      </section>
    </div>
  )
}

function Row({ b }: { b: Booking }) {
  const { now, church } = useStore()
  const c = church(b.churchId)!
  const st = displayStatus(b, now)
  return (
    <div className="card p-4">
      <Link to={`/access/${b.id}`} className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-serif font-semibold text-lg leading-tight">{c.name}</p>
          <p className="text-sm text-muted">
            {fmtDay(b.date)}, {fmtRange(b.start, b.end)} · {b.repertoire} · {euro(b.price)}
          </p>
        </div>
        <span className={`chip whitespace-nowrap ${STATUS_STYLE[st]}`}>{st}</span>
      </Link>
      {st === 'Completed' && (b.review ? <ShowReview b={b} /> : <ReviewForm b={b} />)}
    </div>
  )
}

function ShowReview({ b }: { b: Booking }) {
  return (
    <p className="mt-2 text-sm border-l-4 border-gold pl-2">
      <span className="text-gold">{'★'.repeat(b.review!.rating)}</span> "{b.review!.text}"
    </p>
  )
}

function ReviewForm({ b }: { b: Booking }) {
  const { review } = useStore()
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  return (
    <div className="mt-3 pt-3 border-t border-sand">
      <p className="text-sm font-semibold">How did it sound? Leave a review</p>
      <div className="flex gap-1 my-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className={`text-2xl ${n <= rating ? 'text-gold' : 'text-sand-dark'}`}
            onClick={() => setRating(n)}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="field text-sm"
        rows={2}
        placeholder="Acoustics, welcome, temperature..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="btn btn-primary mt-2 !py-1.5 text-sm" disabled={!rating} onClick={() => review(b.id, rating, text.trim() || 'Great acoustics.')}>
        Publish review
      </button>
    </div>
  )
}
