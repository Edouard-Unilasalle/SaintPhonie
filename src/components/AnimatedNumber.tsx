import { useEffect, useRef, useState } from 'react'

/** Counts smoothly from its first value (`from`) to `value`, then follows later changes. */
export function useAnimated(value: number, from: number, ms = 1800): number {
  const [shown, setShown] = useState(from)
  const shownRef = useRef(from)
  useEffect(() => {
    const start = shownRef.current
    if (start === value) return
    const t0 = performance.now()
    let raf = 0
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms)
      const eased = 1 - Math.pow(1 - k, 3)
      const v = start + (value - start) * eased
      shownRef.current = v
      setShown(v)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    // Small delay so the audience sees the counter start moving.
    const timer = setTimeout(() => (raf = requestAnimationFrame(step)), 400)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [value, ms])
  return shown
}
