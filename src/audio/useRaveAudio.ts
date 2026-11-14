import { useEffect, useState } from 'react'
import { ASSETS } from '../config'
import type { ExperienceEvent } from '../state/experience'
import { RaveAudioEngine } from './RaveAudioEngine'

/**
 * One soundtrack engine for the lifetime of the component, forwarding
 * element events into the experience state machine.
 *
 * The engine object is created once (its constructor has no side effects);
 * the actual <audio> element lives between `attach()` and `detach()` in the
 * effect, so StrictMode's mount → unmount → mount cycle tears the first one
 * down cleanly and two copies of the song can never overlap.
 */
export function useRaveAudio(dispatch: (event: ExperienceEvent) => void): RaveAudioEngine {
  const [engine] = useState(
    () =>
      new RaveAudioEngine(ASSETS.music, {
        onPlaying: () => dispatch({ type: 'AUDIO_PLAYING' }),
        onPause: () => dispatch({ type: 'AUDIO_PAUSED' }),
        onWaiting: () => dispatch({ type: 'AUDIO_WAITING' }),
        onEnded: () => dispatch({ type: 'AUDIO_ENDED' }),
        onError: () => dispatch({ type: 'AUDIO_ERROR' }),
      }),
  )

  useEffect(() => {
    engine.attach()
    return () => engine.detach()
  }, [engine])

  return engine
}
