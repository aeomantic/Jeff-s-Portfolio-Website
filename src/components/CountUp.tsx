import { useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface CountUpProps {
  value: number
  pad?: number
  suffix?: string
  duration?: number
}

const format = (n: number, pad: number) => String(n).padStart(pad, '0')

/**
 * Counts up once when scrolled into view. Screen readers get the final value
 * immediately; only the visual digits animate.
 */
export function CountUp({ value, pad = 0, suffix = '', duration = 1600 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, rootMargin: '0px 0px -15% 0px' })
  const reduced = useReducedMotion()
  const [counted, setCounted] = useState(0)
  const shown = reduced ? value : counted

  useEffect(() => {
    if (!inView || reduced) return
    let frame = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 4)
      setCounted(Math.round(eased * value))
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [inView, reduced, value, duration])

  return (
    <span ref={ref} className="count-up">
      <span aria-hidden="true">
        {format(shown, pad)}
        {suffix}
      </span>
      <span className="sr-only">
        {format(value, pad)}
        {suffix}
      </span>
    </span>
  )
}
