/**
 * The whole experience is one explicit state machine:
 *
 *   ready ──PLAY_STARTED──▶ playing ──AUDIO_ENDED──▶ transitioning ──▶ coffee
 *     │                       │                         ▲                │
 *     └────────SKIP───────────┴──────────SKIP───────────┘                │
 *     ▲                                                                  │
 *     └───────────────────────────────REPLAY─────────────────────────────┘
 *
 * Events that do not apply to the current phase are ignored, which is what
 * keeps late audio callbacks (a `pause` after Skip, a stale `play()` result)
 * from knocking the UI into the wrong scene.
 */

/** What the "ready" screen is waiting on. */
export type Gate =
  | 'checking' // trying to autoplay
  | 'blocked' // browser wants a tap first
  | 'starting' // play() requested, waiting for the audio to actually start
  | 'error' // soundtrack could not load

export type ExperienceState =
  | { phase: 'ready'; gate: Gate; run: number }
  | { phase: 'playing'; paused: boolean; buffering: boolean; run: number }
  | {
      phase: 'transitioning'
      reason: 'ended' | 'skipped'
      stage: 'winddown' | 'pop'
      run: number
    }
  | { phase: 'coffee'; served: number; run: number }

export type ExperienceEvent =
  | { type: 'AUTOPLAY_SLOW' }
  | { type: 'START_REQUESTED' }
  | { type: 'PLAY_STARTED' }
  | { type: 'PLAY_BLOCKED' }
  | { type: 'AUDIO_PLAYING' }
  | { type: 'AUDIO_PAUSED' }
  | { type: 'AUDIO_WAITING' }
  | { type: 'AUDIO_ENDED' }
  | { type: 'AUDIO_ERROR' }
  | { type: 'SKIP' }
  | { type: 'TRANSITION_POP' }
  | { type: 'TRANSITION_DONE' }
  | { type: 'SERVE_COFFEE' }
  | { type: 'REPLAY' }

export const initialExperience: ExperienceState = { phase: 'ready', gate: 'checking', run: 0 }

export function experienceReducer(
  state: ExperienceState,
  event: ExperienceEvent,
): ExperienceState {
  switch (state.phase) {
    case 'ready':
      switch (event.type) {
        case 'AUTOPLAY_SLOW':
          return state.gate === 'checking' ? { ...state, gate: 'blocked' } : state
        case 'START_REQUESTED':
          return state.gate === 'starting' ? state : { ...state, gate: 'starting' }
        case 'PLAY_STARTED':
          return { phase: 'playing', paused: false, buffering: false, run: state.run }
        case 'PLAY_BLOCKED':
          return state.gate === 'error' ? state : { ...state, gate: 'blocked' }
        case 'AUDIO_ERROR':
          return { ...state, gate: 'error' }
        case 'SKIP':
          return { phase: 'transitioning', reason: 'skipped', stage: 'pop', run: state.run }
        default:
          return state
      }

    case 'playing':
      switch (event.type) {
        case 'PLAY_STARTED':
        case 'AUDIO_PLAYING':
          return state.paused || state.buffering
            ? { ...state, paused: false, buffering: false }
            : state
        case 'AUDIO_PAUSED':
          return state.paused ? state : { ...state, paused: true, buffering: false }
        case 'AUDIO_WAITING':
          return state.buffering || state.paused ? state : { ...state, buffering: true }
        case 'AUDIO_ENDED':
          return { phase: 'transitioning', reason: 'ended', stage: 'winddown', run: state.run }
        case 'AUDIO_ERROR':
          return { phase: 'ready', gate: 'error', run: state.run }
        case 'SKIP':
          return { phase: 'transitioning', reason: 'skipped', stage: 'pop', run: state.run }
        default:
          return state
      }

    case 'transitioning':
      if (event.type === 'TRANSITION_POP' && state.stage === 'winddown') {
        return { ...state, stage: 'pop' }
      }
      if (event.type === 'TRANSITION_DONE' && state.stage === 'pop') {
        return { phase: 'coffee', served: 0, run: state.run }
      }
      return state

    case 'coffee':
      if (event.type === 'SERVE_COFFEE') return { ...state, served: state.served + 1 }
      if (event.type === 'REPLAY') return { phase: 'ready', gate: 'starting', run: state.run + 1 }
      return state
  }
}
