import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { checkSlot, needsApproval, SPLIT, useStore } from '../store'
import { SignaturePad } from '../components/SignaturePad'
import { STYLES, type Style } from '../types'
import { euro, fmtDay, fmtRange } from '../lib/time'

const ENSEMBLES = ['Choir', 'Chamber ensemble', 'Jazz band', 'Orchestra', 'Solo musician', 'Music school class', 'Pop or rock band']

export default function BookingPage() {
  const { id = '' } = useParams()
  const [q] = useSearchParams()
  const { s, now, church, addBooking } = useStore()
  const nav = useNavigate()
  const c = church(id)
  const date = q.get('date') ?? ''
  const start = Number(q.get('start'))
  const end = Number(q.get('end'))

  const [step, setStep] = useState(1)
  const [ensemble, setEnsemble] = useState('Choir')
  const [ensembleName, setEnsembleName] = useState('')
  const [musicians, setMusicians] = useState(30)
  const [repertoire, setRepertoire] = useState<Style>('Sacred choral')
  const [useOrgan, setUseOrgan] = useState(false)
  const [accept, setAccept] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)

  if (!c || !date || !(end > start)) return <Navigate to="/search" replace />
  const slotOk = checkSlot(s, c, date, start, end, now).ok
  const hours = end - start
  const price = c.pricePerHour * hours
  const why = needsApproval(c, repertoire, useOrgan)
  const tooMany = musicians > c.capacity

  const pay = () => {
    setPaying(true)
    setTimeout(() => {
      const b = addBooking({
        churchId: c.id,
        date,
        start,
        end,
        ensemble,
        ensembleName: ensembleName.trim() || 'My ensemble',
        musicians,
        repertoire,
        useOrgan,
        signature: signature!,
      })
      nav(`/access/${b.id}`, { replace: true })
    }, 1100)
  }

  const steps = ['Details', 'Agreement', 'Payment']

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link to={`/church/${c.id}`} className="text-sm text-muted hover:text-ink">
        ← {c.name}
      </Link>
      <div className="card p-4">
        <h1 className="text-2xl font-semibold">{c.name}</h1>
        <p className="text-muted">
          {fmtDay(date)}, {fmtRange(start, end)} · {hours} h · {euro(price)}
        </p>
      </div>

      <ol className="flex gap-2" aria-label="Booking steps">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`flex-1 rounded-full py-1.5 text-center text-sm font-semibold ${
              step === i + 1 ? 'bg-glass text-white' : step > i + 1 ? 'bg-ok-light text-ok' : 'bg-sand text-muted'
            }`}
          >
            {step > i + 1 ? '✓ ' : `${i + 1}. `}
            {label}
          </li>
        ))}
      </ol>

      {!slotOk && (
        <p className="rounded-lg bg-warn-light text-warn px-3 py-2 text-sm">
          This slot is no longer available. Please go back and choose another one.
        </p>
      )}

      {step === 1 && (
        <section className="card p-5 space-y-4">
          <h2 className="text-xl font-semibold">Your ensemble</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <label>
              <span className="label">Type of ensemble</span>
              <select className="field" value={ensemble} onChange={(e) => setEnsemble(e.target.value)}>
                {ENSEMBLES.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Ensemble name (optional)</span>
              <input className="field" value={ensembleName} placeholder="My ensemble" onChange={(e) => setEnsembleName(e.target.value)} />
            </label>
            <label>
              <span className="label">Number of musicians</span>
              <input
                className="field"
                type="number"
                min={1}
                max={999}
                value={musicians}
                onChange={(e) => setMusicians(Math.max(1, Number(e.target.value) || 1))}
              />
              {tooMany && <span className="text-xs text-danger">The church holds up to {c.capacity} people.</span>}
            </label>
            <label>
              <span className="label">Repertoire</span>
              <select className="field" value={repertoire} onChange={(e) => setRepertoire(e.target.value as Style)}>
                {STYLES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                    {c.rules.allowedStyles.includes(st) ? '' : ' (needs approval)'}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {c.organ && (
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-5 w-5 accent-glass" checked={useOrgan} onChange={(e) => setUseOrgan(e.target.checked)} />
              <span>I would like to play the organ</span>
            </label>
          )}
          {why.length > 0 ? (
            <div className="rounded-lg bg-warn-light text-warn px-3 py-2 text-sm">
              <p className="font-semibold">This request will be sent to the parish: Pending parish approval.</p>
              <ul className="list-disc pl-5">
                {why.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="rounded-lg bg-ok-light text-ok px-3 py-2 text-sm font-medium">
              ✓ This use is in the parish charter: your booking will be confirmed instantly.
            </p>
          )}
          <div className="flex justify-end">
            <button className="btn btn-primary" disabled={!slotOk || tooMany} onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="card p-5 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Standard agreement</h2>
            <p className="text-sm text-muted">
              Between the Municipality of {c.town} (owner), the parish (assigned user) and {ensembleName.trim() || 'your ensemble'}.
            </p>
          </div>
          <ol className="space-y-3">
            {[
              ['Slot', `${fmtDay(date)}, ${fmtRange(start, end)}, at ${c.name}. Access opens only during this slot.`],
              [
                'Authorised uses',
                `Rehearsal or recording of ${repertoire.toLowerCase()} for up to ${Math.min(musicians, c.capacity)} people. ${c.rules.maxVolume}.${useOrgan ? ' Organ subject to the organist\'s agreement.' : ''}`,
              ],
              ['Responsibilities', 'Leave the church as you found it, respect the sacred character of the place, no food or drink, report any damage.'],
              ['Insurance included', 'Civil liability and damage cover are included in the price of every booking.'],
              ['Worship comes first', 'If a funeral or another service is scheduled at short notice, your slot is moved or fully refunded.'],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-3">
                <span className="h-7 w-7 shrink-0 rounded-full bg-glass text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="h-5 w-5 mt-0.5 accent-glass" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
            <span className="text-sm">I have read the agreement and I accept it on behalf of my ensemble.</span>
          </label>
          <SignaturePad onChange={setSignature} />
          <p className="text-xs text-muted">Demo agreement, not a legal document. The signature stays on this device.</p>
          <div className="flex justify-between">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn btn-primary" disabled={!accept || !signature} onClick={() => setStep(3)}>
              Sign and continue
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="card p-5 space-y-4">
          <h2 className="text-xl font-semibold">Payment</h2>
          <div className="rounded-lg border-2 border-dashed border-warn bg-warn-light text-warn px-3 py-2 text-sm font-semibold text-center">
            Simulated payment, no real transaction. No card details are requested.
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span>
                {hours} h × {euro(c.pricePerHour)}
              </span>
              <span className="text-2xl font-semibold">{euro(price)}</span>
            </div>
            <div className="mt-3 flex h-4 rounded-full overflow-hidden" aria-hidden="true">
              {SPLIT.map((p) => (
                <span key={p.key} style={{ width: `${p.pct * 100}%`, background: p.color }} />
              ))}
            </div>
            <ul className="mt-3 space-y-1.5">
              {SPLIT.map((p) => (
                <li key={p.key} className={`flex items-center gap-2 text-sm ${p.key === 'maintenance' ? 'font-semibold' : ''}`}>
                  <span className="h-3 w-3 rounded-sm" style={{ background: p.color }} />
                  <span>{p.label}</span>
                  <span className="text-muted">{Math.round(p.pct * 100)}%</span>
                  <span className="ml-auto">{euro(Math.round(price * p.pct * 100) / 100)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted">
              The maintenance fund goes to the upkeep of {c.name}: {s.funds[c.id]?.goal.toLowerCase()}.
            </p>
          </div>
          {why.length > 0 && (
            <p className="text-sm rounded-lg bg-warn-light text-warn px-3 py-2">
              Your request needs parish approval. You will only be charged if it is approved.
            </p>
          )}
          <div className="flex justify-between">
            <button className="btn btn-ghost" onClick={() => setStep(2)} disabled={paying}>
              Back
            </button>
            <button className="btn btn-gold" onClick={pay} disabled={paying || !slotOk}>
              {paying ? 'Processing...' : `Pay ${euro(price)} (simulated)`}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
