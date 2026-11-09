import { Link, Navigate, useParams } from 'react-router-dom'
import { displayStatus, useStore } from '../store'
import { QrCode } from '../components/QrCode'
import { at, fmtCountdown, fmtDay, fmtHour, fmtRange } from '../lib/time'

export default function AccessPage() {
  const { id = '' } = useParams()
  const { s, now, church, setDemoOffset } = useStore()
  const b = s.bookings.find((x) => x.id === id)
  if (!b) return <Navigate to="/bookings" replace />
  const c = church(b.churchId)!
  const status = displayStatus(b, now)
  const t0 = at(b.date, b.start)
  const t1 = at(b.date, b.end)
  const phase = now < t0 ? 'before' : now < t1 ? 'open' : 'after'
  const realNow = now - s.demoOffset

  const jump = () => setDemoOffset(t0 + 60_000 - realNow)

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {b.createdAt > realNow - 30_000 && status !== 'Pending parish approval' && (
        <div className="rounded-xl bg-ok-light text-ok px-4 py-3 font-semibold text-center">✓ Booking confirmed. Enjoy the acoustics!</div>
      )}

      <div className="card p-5 text-center">
        <p className="text-sm text-muted">Keyless access</p>
        <h1 className="text-2xl font-semibold">{c.name}</h1>
        <p className="text-muted">
          {fmtDay(b.date)}, {fmtRange(b.start, b.end)}
        </p>

        {status === 'Pending parish approval' && (
          <div className="mt-5 rounded-xl bg-warn-light text-warn p-5">
            <p className="text-3xl" aria-hidden="true">
              ⏳
            </p>
            <p className="font-semibold mt-1">Pending parish approval</p>
            <p className="text-sm mt-1">
              The parish has been asked to approve your repertoire. Your access code will appear here as soon as it is approved.
            </p>
          </div>
        )}

        {status === 'Declined' && (
          <div className="mt-5 rounded-xl bg-sand p-5">
            <p className="font-semibold">Request declined by the parish</p>
            <p className="text-sm text-muted mt-1">You have not been charged. Try another church whose charter fits your repertoire.</p>
          </div>
        )}

        {(status === 'Confirmed' || status === 'Completed') && (
          <>
            <div className="mt-5 flex flex-col items-center">
              <QrCode
                text={`SAINTPHONIE DEMO|${b.id}|${c.id}|${b.date}|${b.start}-${b.end}|${b.code}`}
                className={`w-52 h-52 rounded-xl border border-sand-dark ${phase === 'after' ? 'opacity-30 grayscale' : ''}`}
              />
              <p className="mt-3 text-xs uppercase tracking-widest text-muted">Door code</p>
              <p className="font-mono text-4xl font-bold tracking-[0.3em] text-glass">{b.code}</p>
              <p className="text-xs text-muted mt-1">Valid only from {fmtHour(b.start)} to {fmtHour(b.end)} on {fmtDay(b.date)}</p>
            </div>

            <div className="mt-6">
              {phase === 'before' && (
                <div className="rounded-xl bg-sand p-4">
                  <p className="flex items-center justify-center gap-2 font-semibold text-lg">🔒 Locked</p>
                  <p className="text-sm text-muted">Opens in</p>
                  <p className="font-mono text-3xl font-bold">{fmtCountdown(t0 - now)}</p>
                </div>
              )}
              {phase === 'open' && (
                <div className="rounded-xl bg-ok text-white p-5 glow">
                  <p className="text-4xl" aria-hidden="true">
                    🔓
                  </p>
                  <p className="text-2xl font-bold">Door unlocked</p>
                  <p className="text-sm text-white/85">Locks automatically in {fmtCountdown(t1 - now)}</p>
                </div>
              )}
              {phase === 'after' && (
                <div className="rounded-xl bg-sand p-4">
                  <p className="font-semibold text-lg">🔒 Locked, the slot has ended</p>
                  <p className="text-sm text-muted">Thank you for leaving the church as you found it.</p>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-muted">
              Simulated connected lock. In real life, the code would open a key box or a smart lock at the side door.
            </p>
          </>
        )}
      </div>

      {(status === 'Confirmed' || status === 'Completed') && (
        <div className="card p-4 border-dashed">
          <p className="text-sm font-semibold">Presenter tools</p>
          <p className="text-xs text-muted mb-2">Move the demo clock to show the door opening, without waiting.</p>
          <div className="flex flex-wrap gap-2">
            {phase === 'before' && (
              <button className="btn btn-ghost !py-1.5 text-sm" onClick={jump}>
                ⏩ Jump to the start of the slot
              </button>
            )}
            {s.demoOffset !== 0 && (
              <button className="btn btn-ghost !py-1.5 text-sm" onClick={() => setDemoOffset(0)}>
                Back to real time
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3">
        <Link to="/bookings" className="btn btn-ghost">
          My bookings
        </Link>
        <Link to="/search" className="btn btn-ghost">
          Find another church
        </Link>
      </div>
    </div>
  )
}
