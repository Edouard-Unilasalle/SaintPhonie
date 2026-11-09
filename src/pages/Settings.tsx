import { useState } from 'react'
import { useStore } from '../store'
import { RoleSwitch } from '../components/Layout'

export default function Settings() {
  const { s, reset, setDemoOffset } = useStore()
  const [done, setDone] = useState(false)
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-3xl font-semibold">Settings</h1>

      <section className="card p-5 space-y-2">
        <h2 className="text-xl font-semibold">Role</h2>
        <RoleSwitch />
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="text-xl font-semibold">Demo mode</h2>
        <p className="text-sm text-muted">
          All data lives on this device only. Reset restores the starting churches, services, bookings and funds, with dates
          relative to today.
        </p>
        {!confirm ? (
          <button className="btn btn-primary" onClick={() => (setConfirm(true), setDone(false))}>
            Reset demo data
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Erase your demo bookings and start again?</span>
            <button
              className="btn btn-primary !py-2"
              onClick={() => {
                reset()
                setConfirm(false)
                setDone(true)
              }}
            >
              Yes, reset
            </button>
            <button className="btn btn-ghost !py-2" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </div>
        )}
        {done && <p className="text-sm text-ok font-semibold">✓ Demo data restored.</p>}
        {s.demoOffset !== 0 && (
          <button className="btn btn-ghost" onClick={() => setDemoOffset(0)}>
            Set the demo clock back to real time
          </button>
        )}
      </section>

      <section className="card p-5 space-y-2 text-sm">
        <h2 className="text-xl font-semibold">About this prototype</h2>
        <p>
          SaintPhonie (called Saint-Glinglin in our report) is a student project from UniLaSalle Rouen (creativity exercise, 5th year, Purchasing and Supply Chain).
          It is a demonstration, not a real service.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-muted">
          <li>Church names, addresses and positions: © OpenStreetMap contributors, ODbL licence.</li>
          <li>Map tiles: © OpenStreetMap contributors.</li>
          <li>Acoustics, prices, services, bookings, reviews and funds: fictional demo data.</li>
          <li>The Notre-Dame cathedral is shown as unavailable: it belongs to the State.</li>
          <li>No account, no personal data collected, no real payment. The microphone recording is never saved or sent.</li>
          <li>Illustrations are generic drawings, not portraits of the real buildings.</li>
          <li>Not affiliated with any diocese, municipality or company.</li>
        </ul>
      </section>
    </div>
  )
}
