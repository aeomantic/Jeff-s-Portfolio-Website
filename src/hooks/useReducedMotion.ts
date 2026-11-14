import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia?.(QUERY)
  if (!mql) return () => {}
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

const getSnapshot = () => window.matchMedia?.(QUERY).matches ?? false
const getServerSnapshot = () => false

/** Live `prefers-reduced-motion` preference. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
