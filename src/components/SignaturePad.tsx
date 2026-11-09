import { useEffect, useRef, useState } from 'react'

export function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const length = useRef(0)
  const last = useRef<[number, number]>([0, 0])
  const [empty, setEmpty] = useState(true)

  useEffect(() => {
    const cv = ref.current!
    const ratio = window.devicePixelRatio || 1
    const rect = cv.getBoundingClientRect()
    cv.width = rect.width * ratio
    cv.height = rect.height * ratio
    const g = cv.getContext('2d')!
    g.scale(ratio, ratio)
    g.lineWidth = 2.4
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.strokeStyle = '#142849'
  }, [])

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top] as const
  }
  const down = (e: React.PointerEvent) => {
    ref.current!.setPointerCapture(e.pointerId)
    drawing.current = true
    const g = ref.current!.getContext('2d')!
    const [x, y] = pos(e)
    g.beginPath()
    g.moveTo(x, y)
    last.current = [x, y]
    setEmpty(false)
  }
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return
    const g = ref.current!.getContext('2d')!
    const [x, y] = pos(e)
    g.lineTo(x, y)
    g.stroke()
    length.current += Math.hypot(x - last.current[0], y - last.current[1])
    last.current = [x, y]
  }
  const up = () => {
    if (!drawing.current) return
    drawing.current = false
    if (length.current > 40) {
      onChange(ref.current!.toDataURL('image/png'))
    }
  }
  const clear = () => {
    const cv = ref.current!
    cv.getContext('2d')!.clearRect(0, 0, cv.width, cv.height)
    length.current = 0
    setEmpty(true)
    onChange(null)
  }

  return (
    <div>
      <div className="relative rounded-xl border-2 border-dashed border-stone-line bg-white">
        <canvas
          ref={ref}
          className="block w-full h-36 touch-none cursor-crosshair"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          aria-label="Signature area, draw with your finger or mouse"
        />
        {empty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted text-sm">
            Sign here with your finger or mouse
          </span>
        )}
        <span className="pointer-events-none absolute left-4 right-4 bottom-6 border-b border-sand-dark" />
      </div>
      <button type="button" className="mt-1 text-sm text-muted underline" onClick={clear}>
        Clear signature
      </button>
    </div>
  )
}
