import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { ChurchArt } from '../components/ChurchArt'
import { ReverbGauge } from '../components/ReverbGauge'
import { ListenCard } from '../components/ListenCard'
import { WeekCalendar, type Slot } from '../components/WeekCalendar'
import { idealFor } from '../data/churches'
import { STYLES } from '../types'
import { euro, fmtDay, fmtHour, fmtRange } from '../lib/time'

export function DemoNote() {
  return (
    <p className="text-xs text-warn bg-warn-light rounded-lg px-3 py-2">
      Demo data: acoustic values, capacity, equipment, prices, services and reviews are fictional. Only the name, address and
      location come from OpenStreetMap.
    </p>
  )
}

export default function ChurchPage() {
  const { id = '' } = useParams()
  const { s, church } = useStore()
  const nav = useNavigate()
  const c = church(id)
  const [sel, setSel] = useState<Slot | null>(null)
  const [msg, setMsg] = useState<{ tone: 'worship' | 'warn'; text: string } | null>(null)

  if (!c || !c.available) return <Navigate to="/search" replace />

  const reviews = s.bookings.filter((b) => b.churchId === c.id && b.review)
  const avg = reviews.length ? reviews.reduce((a, b) => a + b.review!.rating, 0) / reviews.length : 0
  const book = () => sel && nav(`/church/${c.id}/book?date=${sel.date}&start=${sel.start}&end=${sel.end}`)

  return (
    <div className="space-y-5">
      <Link to="/search" className="text-sm text-muted hover:text-ink">
        ← Back to search
      </Link>

      <div className="grid md:grid-cols-[1.1fr_1fr] gap-5 items-start">
        <ChurchArt variant={c.art} className="w-full rounded-2xl border border-sand-dark" />
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {c.village && <span className="chip !bg-gold-light">Village church</span>}
            {reviews.length > 0 && (
              <span className="chip">
                ★ {avg.toFixed(1)} · {reviews.length} review{reviews.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold">{c.name}</h1>
          <p className="text-muted mt-1">{c.address}</p>
          <p className="mt-3">{c.history}</p>
          <p className="mt-3 text-2xl font-semibold">
            {euro(c.pricePerHour)} <span className="text-base font-normal text-muted">per hour, insurance included</span>
          </p>
          <div className="mt-3">
            <DemoNote />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="card p-5">
          <h2 className="text-2xl font-semibold">Acoustic profile</h2>
          <div className="mt-2 flex flex-col sm:flex-row items-center gap-4">
            <ReverbGauge value={c.reverb} />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm w-full">
              <dt className="text-muted">Reverberation</dt>
              <dd className="font-semibold">{c.reverb.toFixed(1)} s</dd>
              <dt className="text-muted">Volume</dt>
              <dd className="font-semibold">{c.volume.toLocaleString('en-GB')} m³</dd>
              <dt className="text-muted">Capacity</dt>
              <dd className="font-semibold">{c.capacity} people</dd>
              <dt className="text-muted">Organ</dt>
              <dd className="font-semibold">{c.organ ? 'Yes, on request' : 'No'}</dd>
              <dt className="text-muted">Piano</dt>
              <dd className="font-semibold">{c.piano ? 'Yes' : 'No'}</dd>
              <dt className="text-muted">Heating</dt>
              <dd className="font-semibold">{c.heating ? 'Yes' : 'No, dress warmly'}</dd>
            </dl>
          </div>
          <p className="mt-3 rounded-lg bg-glass-light text-glass px-3 py-2 font-semibold">
            Ideal for: {idealFor(c.reverb).join(', ')}
          </p>
        </section>

        <ListenCard rt={c.reverb} name={c.name} />
      </div>

      <section className="card p-5">
        <h2 className="text-2xl font-semibold">Parish rules</h2>
        <p className="text-sm text-muted">Set by the parish. Other styles can be requested and go to the parish for approval.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STYLES.map((st) => {
            const ok = c.rules.allowedStyles.includes(st)
            return (
              <span key={st} className={`chip ${ok ? '!bg-ok-light !text-ok' : '!bg-sand !text-muted line-through decoration-1'}`}>
                {ok ? '✓' : '·'} {st}
              </span>
            )
          })}
        </div>
        <ul className="mt-3 text-sm space-y-1">
          <li>🎹 {c.organ ? c.rules.organ : 'No organ in this church.'}</li>
          <li>🔊 {c.rules.maxVolume}</li>
          <li>🕘 Open to musicians from {fmtRange(c.rules.hours[0], c.rules.hours[1])}, outside services</li>
          <li>⛪ Worship always has priority. Masses, weddings and funerals block the calendar automatically.</li>
        </ul>
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 className="text-2xl font-semibold">Availability this week</h2>
          <p className="text-sm text-muted">Tap a free hour, tap a later hour to extend (up to 4 h).</p>
        </div>
        <WeekCalendar church={c} selection={sel} onSelect={setSel} onMessage={setMsg} />
        {msg && (
          <p
            role="alert"
            className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${
              msg.tone === 'worship' ? 'bg-worship-light text-worship' : 'bg-warn-light text-warn'
            }`}
          >
            {msg.tone === 'worship' ? '⛪ ' : ''}
            {msg.text}
          </p>
        )}
      </section>

      {reviews.length > 0 && (
        <section className="card p-5">
          <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
          <div className="space-y-3">
            {reviews.map((b) => (
              <blockquote key={b.id} className="border-l-4 border-gold pl-3">
                <p className="text-gold">{'★'.repeat(b.review!.rating)}{'☆'.repeat(5 - b.review!.rating)}</p>
                <p>"{b.review!.text}"</p>
                <footer className="text-xs text-muted">
                  {b.review!.author}, {fmtDay(b.date)} (fictional review)
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      <div className="sticky bottom-20 md:bottom-4 z-[500]">
        <div className="card p-3 flex items-center gap-3 shadow-lg">
          <div className="flex-1 text-sm">
            {sel ? (
              <>
                <p className="font-semibold">
                  {fmtDay(sel.date)}, {fmtHour(sel.start)} to {fmtHour(sel.end)}
                </p>
                <p className="text-muted">
                  {sel.end - sel.start} h · {euro(c.pricePerHour * (sel.end - sel.start))}
                </p>
              </>
            ) : (
              <p className="text-muted">Choose a slot in the calendar</p>
            )}
          </div>
          <button className="btn btn-primary" disabled={!sel} onClick={book}>
            Book this slot
          </button>
        </div>
      </div>
    </div>
  )
}
