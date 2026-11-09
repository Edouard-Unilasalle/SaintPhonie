import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { checkSlot, useStore } from '../store'
import { ChurchMap } from '../components/ChurchMap'
import { DualRange } from '../components/DualRange'
import { ChurchArt } from '../components/ChurchArt'
import { fmtDay, fmtHour, nextDays } from '../lib/time'
import type { Church } from '../types'

interface Filters {
  rt: [number, number]
  people: number
  piano: boolean
  organ: boolean
  heating: boolean
  date: string
  start: number
  duration: number
}

// Kept at module level so filters survive navigation during the demo.
let saved: Filters = { rt: [1, 9], people: 0, piano: false, organ: false, heating: false, date: '', start: 19, duration: 2 }

export default function Search() {
  const { s, now } = useStore()
  const [f, setF] = useState<Filters>(saved)
  const [tab, setTab] = useState<'map' | 'list'>('map')
  useEffect(() => {
    saved = f
  }, [f])
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v }))
  const days = nextDays(7, now)

  const bookable = s.churches.filter((c) => c.available)
  const results = useMemo(
    () =>
      bookable.filter(
        (c) =>
          c.reverb >= f.rt[0] &&
          c.reverb <= f.rt[1] &&
          c.capacity >= f.people &&
          (!f.piano || c.piano) &&
          (!f.organ || c.organ) &&
          (!f.heating || c.heating) &&
          (!f.date || checkSlot(s, c, f.date, f.start, f.start + f.duration, now).ok),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s, f, Math.floor(now / 60000)],
  )
  const matches = new Set(results.map((c) => c.id))
  const reset = () => setF({ ...saved, rt: [1, 9], people: 0, piano: false, organ: false, heating: false, date: '' })

  const filters = (
    <div className="card p-4 space-y-4">
      <div>
        <div className="flex justify-between items-baseline">
          <span className="label">Reverberation time</span>
          <span className="text-sm font-semibold text-glass">
            {f.rt[0].toFixed(1)} s to {f.rt[1].toFixed(1)} s
          </span>
        </div>
        <DualRange value={f.rt} onChange={(v) => set('rt', v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className="label">Group size</span>
          <select className="field" value={f.people} onChange={(e) => set('people', Number(e.target.value))}>
            <option value={0}>Any size</option>
            <option value={10}>10+ people</option>
            <option value={40}>40+ people</option>
            <option value={150}>150+ people</option>
            <option value={400}>400+ people</option>
          </select>
        </label>
        <label>
          <span className="label">Date</span>
          <select className="field" value={f.date} onChange={(e) => set('date', e.target.value)}>
            <option value="">Any day</option>
            {days.map((d, i) => (
              <option key={d} value={d}>
                {i === 0 ? 'Today' : fmtDay(d)}
              </option>
            ))}
          </select>
        </label>
        {f.date && (
          <>
            <label>
              <span className="label">From</span>
              <select className="field" value={f.start} onChange={(e) => set('start', Number(e.target.value))}>
                {Array.from({ length: 13 }, (_, i) => 9 + i).map((h) => (
                  <option key={h} value={h}>
                    {fmtHour(h)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Duration</span>
              <select className="field" value={f.duration} onChange={(e) => set('duration', Number(e.target.value))}>
                {[1, 2, 3, 4].map((h) => (
                  <option key={h} value={h}>
                    {h} hour{h > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['organ', 'Organ'],
            ['piano', 'Piano'],
            ['heating', 'Heated'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => set(k, !f[k])}
            aria-pressed={f[k]}
            className={`chip !text-sm !px-3 !py-1.5 border ${f[k] ? '!bg-glass !text-white border-glass' : 'border-stone-line'}`}
          >
            {f[k] ? '✓ ' : ''}
            {label}
          </button>
        ))}
        <button onClick={reset} className="ml-auto text-sm text-muted underline">
          Clear filters
        </button>
      </div>
    </div>
  )

  const list = (
    <div className="space-y-3">
      {results.map((c) => (
        <ResultCard key={c.id} c={c} />
      ))}
      {results.length === 0 && (
        <div className="card p-6 text-center text-muted">No church matches these filters. Try a wider reverberation range.</div>
      )}
      {s.churches
        .filter((c) => !c.available)
        .map((c) => (
          <div key={c.id} className="card p-4 flex gap-3 opacity-80">
            <ChurchArt variant={c.art} className="w-20 h-14 rounded-lg shrink-0 grayscale" glow={false} />
            <div>
              <p className="font-serif font-semibold">{c.name}</p>
              <span className="chip !bg-sand-dark">Not available on the platform</span>
              <p className="text-xs text-muted mt-1">{c.unavailableReason}</p>
            </div>
          </div>
        ))}
    </div>
  )

  return (
    <div>
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <h1 className="text-3xl font-semibold">Find your church</h1>
          <p className="text-muted text-sm">Rouen, the city of a hundred bell towers, and nearby villages.</p>
        </div>
        <p className="text-sm font-semibold text-glass whitespace-nowrap" aria-live="polite">
          {results.length} of {bookable.length} churches
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-5">
        <div className="space-y-4">
          {filters}
          <div className="hidden lg:block max-h-[calc(100dvh-560px)] min-h-64 overflow-y-auto pr-1">{list}</div>
        </div>

        <div>
          <div className="lg:hidden flex rounded-full bg-sand p-1 my-4 w-fit">
            {(['map', 'list'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-5 py-1.5 text-sm font-semibold ${tab === t ? 'bg-white shadow text-glass' : 'text-muted'}`}
              >
                {t === 'map' ? 'Map' : 'List'}
              </button>
            ))}
          </div>
          <div className={tab === 'map' ? '' : 'hidden lg:block'}>
            <ChurchMap
              churches={s.churches}
              matches={matches}
              className="h-[58dvh] lg:h-[calc(100dvh-180px)] rounded-2xl border border-sand-dark z-0"
            />
            <div className="flex gap-4 text-xs text-muted mt-2">
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-glass" /> City church
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-gold" /> Village church
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-[#9a9a9a]" /> Not on the platform
              </span>
            </div>
          </div>
          <div className={`lg:hidden ${tab === 'list' ? '' : 'hidden'}`}>{list}</div>
        </div>
      </div>
    </div>
  )
}

function ResultCard({ c }: { c: Church }) {
  return (
    <Link to={`/church/${c.id}`} className="card p-3 flex gap-3 hover:border-glass transition">
      <ChurchArt variant={c.art} className="w-24 h-[68px] rounded-lg shrink-0" glow={false} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-serif font-semibold leading-tight">{c.name}</p>
          <span className="text-sm font-semibold whitespace-nowrap">€{c.pricePerHour}/h</span>
        </div>
        <p className="text-xs text-muted truncate">
          {c.town}
          {c.village ? ' · village church' : ''}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          <span className="chip !bg-glass-light !text-glass">{c.reverb.toFixed(1)} s</span>
          <span className="chip">{c.capacity} people</span>
          {c.organ && <span className="chip">Organ</span>}
          {c.piano && <span className="chip">Piano</span>}
          {c.heating && <span className="chip">Heated</span>}
        </div>
      </div>
    </Link>
  )
}
