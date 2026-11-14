import { useCallback, useEffect, useReducer, useRef } from 'react'
import type { PlayResult } from './audio/RaveAudioEngine'
import { useRaveAudio } from './audio/useRaveAudio'
import { CoffeeScene } from './components/CoffeeScene'
import { RaveScene } from './components/RaveScene'
import { TransitionOverlay, type OverlayMode } from './components/TransitionOverlay'
import { ASSETS } from './config'
import { useReducedMotion } from './hooks/useReducedMotion'
import {
  experienceReducer,
  initialExperience,
  type ExperienceEvent,
  type ExperienceState,
} from './state/experience'

/** How long the cat spins down after the last note before the coffee pop. */
const WINDDOWN_MS = 1500
/** How long the cream circle takes to cover the rave. */
const POP_MS = 720
/** Show the start button if the autoplay attempt hasn't settled by then. */
const AUTOPLAY_PATIENCE_MS = 1500

function resultToEvent(result: PlayResult): ExperienceEvent | null {
  switch (result) {
    case 'playing':
      return { type: 'PLAY_STARTED' }
    case 'blocked':
      return { type: 'PLAY_BLOCKED' }
    case 'error':
      return { type: 'AUDIO_ERROR' }
    case 'aborted':
      return null // superseded by something newer (e.g. Skip)
  }
}

function statusMessage(state: ExperienceState): string {
  switch (state.phase) {
    case 'ready':
      if (state.gate === 'blocked') return 'Ready. Press “Tap to Start the Rave” to begin with sound.'
      if (state.gate === 'starting') return 'Starting the music…'
      return ''
    case 'playing':
      if (state.paused) return 'Music paused.'
      if (state.buffering) return 'Buffering…'
      return 'The rave has started. Music is playing.'
    case 'transitioning':
      return state.reason === 'ended' ? 'The song is over. Coffee time.' : 'Intro skipped.'
    case 'coffee':
      return ''
  }
}

export default function App() {
  const [state, dispatch] = useReducer(experienceReducer, initialExperience)
  const reducedMotion = useReducedMotion()
  const engine = useRaveAudio(dispatch)
  const playToken = useRef(0)

  /** Every play attempt gets a token; results from superseded attempts are ignored. */
  const requestPlay = useCallback(
    (gesture: boolean, fromStart: boolean) => {
      const token = ++playToken.current
      void engine.play({ gesture, fromStart }).then((result) => {
        if (token !== playToken.current) return
        const event = resultToEvent(result)
        if (event) dispatch(event)
      })
    },
    [engine],
  )

  // Attempt unmuted autoplay as soon as the soundtrack exists. Browsers will
  // usually refuse, and the start button takes over. (Declared after
  // useRaveAudio, so the element is attached before this runs.)
  useEffect(() => {
    const slow = window.setTimeout(() => dispatch({ type: 'AUTOPLAY_SLOW' }), AUTOPLAY_PATIENCE_MS)
    requestPlay(false, true)
    return () => window.clearTimeout(slow)
  }, [requestPlay])

  // Sound is only allowed while the rave is on screen (guards against media
  // keys resuming the song on the coffee screen).
  useEffect(() => {
    engine.setPlaybackAllowed(state.phase === 'ready' || state.phase === 'playing')
  }, [engine, state.phase])

  // Visual timing of the transition. What *starts* it is the audio element's
  // real `ended` event (or Skip); these timeouts only pace the animation.
  const transitionStage = state.phase === 'transitioning' ? state.stage : null
  useEffect(() => {
    if (!transitionStage) return
    const [event, delay]: [ExperienceEvent, number] =
      transitionStage === 'winddown'
        ? [{ type: 'TRANSITION_POP' }, reducedMotion ? 200 : WINDDOWN_MS]
        : [{ type: 'TRANSITION_DONE' }, reducedMotion ? 320 : POP_MS]
    const id = window.setTimeout(() => dispatch(event), delay)
    return () => window.clearTimeout(id)
  }, [transitionStage, reducedMotion])

  // Dev-only debugging handle (stripped from production builds):
  // window.__oiia.engine / window.__oiia.state in the console.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    ;(window as Window & { __oiia?: unknown }).__oiia = { engine, state }
  }, [engine, state])

  // Warm the coffee photo during the rave so the reveal is instant.
  useEffect(() => {
    const img = new Image()
    img.src = ASSETS.coffeeCat
    img.decode?.().catch(() => {})
  }, [])

  // Keep the page chrome in tune with the scene.
  useEffect(() => {
    const coffee = state.phase === 'coffee'
    document.body.dataset.scene = coffee ? 'coffee' : 'rave'
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', coffee ? '#fff6ea' : '#12061f')
    document.title = coffee ? 'Coffee? ☕ · OIIA Cat Rave' : 'OIIA Cat Rave ☕'
  }, [state.phase])

  const handleStart = () => {
    dispatch({ type: 'START_REQUESTED' })
    requestPlay(true, true)
  }

  const handlePause = () => engine.pause()

  const handleResume = () => requestPlay(true, false)

  const handleSkip = () => {
    playToken.current++ // any in-flight play() result is now stale
    dispatch({ type: 'SKIP' })
    engine.stop()
  }

  const handleServe = () => dispatch({ type: 'SERVE_COFFEE' })

  const handleReplay = () => {
    dispatch({ type: 'REPLAY' })
    // The click itself is the user gesture, so the song can restart right away.
    requestPlay(true, true)
  }

  const overlayMode: OverlayMode =
    state.phase === 'transitioning' && state.stage === 'pop'
      ? 'pop'
      : state.phase === 'coffee'
        ? 'reveal'
        : 'hidden'

  return (
    <>
      {state.phase === 'coffee' ? (
        <CoffeeScene
          served={state.served}
          reducedMotion={reducedMotion}
          onServe={handleServe}
          onReplay={handleReplay}
        />
      ) : (
        <RaveScene
          key={state.run}
          engine={engine}
          state={state}
          reducedMotion={reducedMotion}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onSkip={handleSkip}
        />
      )}
      <TransitionOverlay mode={overlayMode} />
      <p className="visually-hidden" role="status" aria-live="polite">
        {statusMessage(state)}
      </p>
    </>
  )
}
