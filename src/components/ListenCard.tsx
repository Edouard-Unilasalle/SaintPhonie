import { useEffect, useRef, useState } from 'react'
import { playMotif, playRecording, recordVoice, stopAll } from '../lib/audio'

type Phase = 'idle' | 'dry' | 'church' | 'countdown' | 'recording' | 'mine-dry' | 'mine-church'

export function ListenCard({ rt, name }: { rt: number; name: string }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [count, setCount] = useState(3)
  const [micError, setMicError] = useState('')
  const [voice, setVoice] = useState<AudioBuffer | null>(null)
  const timers = useRef<number[]>([])

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  const later = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, ms))
  useEffect(
    () => () => {
      clear()
      stopAll()
    },
    [],
  )

  const stop = () => {
    clear()
    stopAll()
    setPhase('idle')
  }

  const play = (mode: 'dry' | 'church', then?: () => void) => {
    setPhase(mode)
    const dur = playMotif(mode, rt)
    later(dur * 1000, () => (then ? then() : setPhase('idle')))
  }

  const compare = () => {
    clear()
    play('dry', () => later(400, () => play('church')))
  }

  const sing = async () => {
    clear()
    stopAll()
    setMicError('')
    setPhase('countdown')
    for (let i = 3; i > 0; i--) {
      setCount(i)
      await new Promise((r) => setTimeout(r, 700))
    }
    setPhase('recording')
    try {
      const buf = await recordVoice(3)
      setVoice(buf)
      playMine(buf)
    } catch (e) {
      const err = e as Error
      setMicError(
        err.message === 'unsupported'
          ? 'This browser cannot record audio here. The demo works without it.'
          : 'Microphone not available or permission refused. No problem, the rest of the demo works without it.',
      )
      setPhase('idle')
    }
  }

  const playMine = (buf: AudioBuffer) => {
    clear()
    setPhase('mine-church')
    const d = playRecording(buf, rt)
    later(d * 1000, () => setPhase('idle'))
  }
  const playMineDry = (buf: AudioBuffer) => {
    clear()
    setPhase('mine-dry')
    const d = playRecording(buf, null)
    later(d * 1000, () => setPhase('idle'))
  }

  const status: Record<Phase, string> = {
    idle: '',
    dry: 'Playing: dry, as in a small rehearsal room',
    church: `Playing: in ${name}`,
    countdown: `Get ready to sing... ${count}`,
    recording: 'Recording 3 seconds, sing now!',
    'mine-dry': 'Your voice, dry',
    'mine-church': `Your voice, in ${name}`,
  }
  const busy = phase !== 'idle'

  return (
    <section className="card p-5 bg-linear-to-br from-glass to-glass-dark text-white border-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Listen to the church</h2>
          <p className="text-sm text-white/75">
            Simulated from a reverberation time of {rt.toFixed(1)} s. Turn the sound up.
          </p>
        </div>
        <span className="text-3xl" aria-hidden="true">
          🎧
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button className="btn bg-white/10 hover:bg-white/20 !px-2" onClick={() => (clear(), play('dry'))} disabled={phase === 'recording'}>
          Dry
        </button>
        <button className="btn btn-gold !px-2" onClick={() => (clear(), play('church'))} disabled={phase === 'recording'}>
          In this church
        </button>
        <button className="btn bg-white/10 hover:bg-white/20 !px-2" onClick={compare} disabled={phase === 'recording'}>
          Compare
        </button>
      </div>

      <div className="mt-3 h-8 flex items-center gap-3 text-sm" aria-live="polite">
        {busy && phase !== 'countdown' && (
          <span className="eq" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </span>
        )}
        <span className={phase === 'recording' ? 'font-bold text-gold' : ''}>{status[phase]}</span>
        {busy && phase !== 'recording' && phase !== 'countdown' && (
          <button className="ml-auto text-white/70 underline" onClick={stop}>
            Stop
          </button>
        )}
      </div>

      <div className="mt-2 pt-4 border-t border-white/15">
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn bg-white text-glass" onClick={sing} disabled={phase === 'recording' || phase === 'countdown'}>
            🎤 Sing into it
          </button>
          {voice && (
            <>
              <button className="btn bg-white/10 hover:bg-white/20 !px-3 text-sm" onClick={() => playMineDry(voice)} disabled={phase === 'recording'}>
                My voice, dry
              </button>
              <button className="btn bg-white/10 hover:bg-white/20 !px-3 text-sm" onClick={() => playMine(voice)} disabled={phase === 'recording'}>
                In the church
              </button>
            </>
          )}
        </div>
        <p className="mt-2 text-xs text-white/60">
          Records 3 seconds from your microphone and plays it back with the church's reverberation. Nothing is saved or sent.
        </p>
        {micError && <p className="mt-2 text-sm text-gold-light">{micError}</p>}
      </div>
    </section>
  )
}
