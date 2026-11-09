/*
 * "Listen to the church": everything is synthesised in the browser.
 * The church is simulated by a ConvolverNode fed with a synthetic impulse
 * response: stereo noise with an exponential decay reaching -60 dB after the
 * church's reverberation time (RT60), slowly darkening like stone vaults do.
 */

let ctx: AudioContext | null = null
const irCache = new Map<number, AudioBuffer>()

export function audioCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function impulseResponse(c: AudioContext, rt60: number): AudioBuffer {
  const key = Math.round(rt60 * 10)
  const hit = irCache.get(key)
  if (hit && hit.sampleRate === c.sampleRate) return hit
  const sr = c.sampleRate
  const len = Math.floor(sr * Math.min(rt60 * 1.15, 9.5))
  const buf = c.createBuffer(2, len, sr)
  const decay = 6.91 / rt60 // ln(1000): amplitude reaches -60 dB at t = rt60
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    let y = 0
    for (let i = 0; i < len; i++) {
      const t = i / sr
      const x = Math.random() * 2 - 1
      // One-pole low-pass that closes over time: high frequencies die first.
      const a = 0.08 + 0.85 * Math.exp(-t / (rt60 * 0.35))
      y += a * (x - y)
      const fadeIn = t < 0.012 ? t / 0.012 : 1
      data[i] = y * Math.exp(-decay * t) * fadeIn
    }
  }
  irCache.set(key, buf)
  return buf
}

/** Short motif: an arpeggio, a held chord and a final staccato chord. Lasts about 2.6 s. */
function scheduleMotif(c: AudioContext, out: AudioNode, t0: number) {
  const note = (freq: number, start: number, dur: number, gain = 0.18) => {
    const g = c.createGain()
    g.gain.setValueAtTime(0, t0 + start)
    g.gain.linearRampToValueAtTime(gain, t0 + start + 0.03)
    g.gain.setTargetAtTime(gain * 0.6, t0 + start + 0.05, 0.15)
    g.gain.setTargetAtTime(0, t0 + start + dur, 0.04)
    g.connect(out)
    for (const [type, mult, level] of [
      ['triangle', 1, 1],
      ['sine', 2, 0.35],
      ['sine', 0.5, 0.25],
    ] as const) {
      const o = c.createOscillator()
      o.type = type
      o.frequency.value = freq * mult
      o.detune.value = (Math.random() - 0.5) * 8
      const og = c.createGain()
      og.gain.value = level
      o.connect(og).connect(g)
      o.start(t0 + start)
      o.stop(t0 + start + dur + 0.4)
    }
  }
  const D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, B3 = 246.94, G4 = 392
  note(D4, 0, 0.22)
  note(Fs4, 0.28, 0.22)
  note(A4, 0.56, 0.22)
  note(D5, 0.84, 0.3)
  ;[B3, D4, G4, D5].forEach((f) => note(f, 1.3, 0.7, 0.11))
  ;[D4, Fs4, A4, D5].forEach((f) => note(f, 2.25, 0.18, 0.13))
}

export const MOTIF_LENGTH = 2.6

let current: GainNode | null = null

export function stopAll() {
  if (current) {
    const g = current
    try {
      g.gain.setTargetAtTime(0, g.context.currentTime, 0.05)
      setTimeout(() => g.disconnect(), 300)
    } catch {
      /* already gone */
    }
    current = null
  }
}

function session(): { c: AudioContext; master: GainNode } {
  stopAll()
  const c = audioCtx()
  const master = c.createGain()
  master.gain.value = 0.9
  master.connect(c.destination)
  current = master
  return { c, master }
}

function churchBus(c: AudioContext, master: AudioNode, rt60: number): AudioNode {
  const input = c.createGain()
  const dry = c.createGain()
  dry.gain.value = 0.45
  const conv = c.createConvolver()
  conv.buffer = impulseResponse(c, rt60)
  const wet = c.createGain()
  wet.gain.value = 1.4 / Math.sqrt(rt60)
  input.connect(dry).connect(master)
  input.connect(conv).connect(wet).connect(master)
  return input
}

/** Plays the motif. Returns total duration in seconds, tail included. */
export function playMotif(mode: 'dry' | 'church', rt60: number): number {
  const { c, master } = session()
  const t0 = c.currentTime + 0.08
  if (mode === 'dry') {
    scheduleMotif(c, master, t0)
    return MOTIF_LENGTH + 0.3
  }
  scheduleMotif(c, churchBus(c, master, rt60), t0)
  return MOTIF_LENGTH + rt60 * 0.8
}

/* ---------- Microphone: "Sing into it" ---------- */

export async function recordVoice(seconds = 3): Promise<AudioBuffer> {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    throw new Error('unsupported')
  }
  const c = audioCtx()
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true },
  })
  try {
    const rec = new MediaRecorder(stream)
    const chunks: Blob[] = []
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
    const stopped = new Promise<void>((r) => (rec.onstop = () => r()))
    rec.start()
    await new Promise((r) => setTimeout(r, seconds * 1000))
    rec.stop()
    await stopped
    const blob = new Blob(chunks, { type: rec.mimeType })
    return await c.decodeAudioData(await blob.arrayBuffer())
  } finally {
    stream.getTracks().forEach((t) => t.stop())
  }
}

export function playRecording(buf: AudioBuffer, rt60: number | null): number {
  const { c, master } = session()
  const src = c.createBufferSource()
  src.buffer = buf
  src.connect(rt60 ? churchBus(c, master, rt60) : master)
  src.start(c.currentTime + 0.05)
  return buf.duration + (rt60 ? rt60 * 0.8 : 0.2)
}
