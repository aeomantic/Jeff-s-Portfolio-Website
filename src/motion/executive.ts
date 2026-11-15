import { createContext, useContext } from 'react'

export interface ExecutiveState {
  /** True while Executive Mode is switched off (the Easter egg is running). */
  off: boolean
  disable(): void
  restore(): void
}

export const ExecutiveContext = createContext<ExecutiveState>({
  off: false,
  disable: () => {},
  restore: () => {},
})

export const useExecutive = () => useContext(ExecutiveContext)

/** How long the Easter egg runs before professionalism resumes on its own. */
export const EXECUTIVE_OFF_MS = 9000
