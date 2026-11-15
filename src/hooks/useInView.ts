import { useEffect, useState, type RefObject } from 'react'

interface Options {
  /** Stop observing after the first intersection. */
  once?: boolean
  rootMargin?: string
  threshold?: number
}

/** Whether an element is in the viewport. Falls back to `true` without IntersectionObserver. */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { once = false, rootMargin = '0px', threshold = 0 }: Options = {},
): boolean {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) io.disconnect()
      },
      { rootMargin, threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, once, rootMargin, threshold])

  return inView
}
