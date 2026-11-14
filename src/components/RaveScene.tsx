import { useEffect, useRef } from 'react'
import { SPECTRUM_BANDS, type LiveLevels, type RaveAudioEngine } from '../audio/RaveAudioEngine'
import { Choreographer, type RaveMode } from '../rave/choreography'
import { ParticleField } from '../rave/particles'
import type { ExperienceState } from '../state/experience'
import { SpinningCat } from './SpinningCat'
import './RaveScene.css'

export type RaveState = Extract<ExperienceState, { phase: 'ready' | 'playing' | 'transitioning' }>

interface RaveSceneProps {
  engine: RaveAudioEngine
  state: RaveState
  reducedMotion: boolean
  onStart(): void
  onPause(): void
  onResume(): void
  onSkip(): void
}

function modeFor(state: RaveState): RaveMode {
  if (state.phase === 'playing') return state.paused ? 'paused' : 'playing'
  if (state.phase === 'transitioning') return 'winddown'
  return 'idle'
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export function RaveScene({ engine, state, reducedMotion, onStart, onPause, onResume, onSkip }: RaveSceneProps) {
  const mode = modeFor(state)
  const modeRef = useRef(mode)
  const reducedRef = useRef(reducedMotion)
  useEffect(() => {
    modeRef.current = mode
    reducedRef.current = reducedMotion
  }, [mode, reducedMotion])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const blobsRef = useRef<HTMLDivElement>(null)
  const beamsRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const ghost1Ref = useRef<HTMLDivElement>(null)
  const ghost2Ref = useRef<HTMLDivElement>(null)
  const shadeRef = useRef<HTMLImageElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)

  // ---- the animation loop: one rAF, direct style writes, no React renders
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const choreo = new Choreographer()
    const particles = new ParticleField(canvas)
    const levels: LiveLevels = {
      bass: 0,
      mid: 0,
      high: 0,
      energy: 0,
      spectrum: new Float32Array(SPECTRUM_BANDS),
    }
    let raf = 0
    let last = performance.now()
    let lastSecond = -1
    let nextMeasure = 0

    const measure = () => {
      const stage = stageRef.current
      if (!stage) return
      const c = canvas.getBoundingClientRect()
      const r = stage.getBoundingClientRect()
      particles.setFocus({
        x: r.left - c.left + r.width / 2,
        y: r.top - c.top + r.height / 2,
        rx: r.width / 2,
        ry: r.height / 2,
      })
    }

    const tick = (nowMs: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, Math.max(0, (nowMs - last) / 1000))
      last = nowMs
      const now = nowMs / 1000
      // The stage eases between layouts (idle ↔ playing), so refresh the
      // particle focus area a few times a second; reads happen before writes.
      if (now >= nextMeasure) {
        measure()
        nextMeasure = now + 0.4
      }

      const mode = modeRef.current
      const reduced = reducedRef.current
      const live = mode === 'playing' && engine.readLevels(levels) ? levels : null
      const songTime = engine.currentTime
      const pose = choreo.update({ dt, now, mode, songTime, reducedMotion: reduced, live })

      const lift = `translate3d(0, ${(-pose.hop * 100).toFixed(2)}%, 0) scale(${pose.scaleX.toFixed(4)}, ${pose.scaleY.toFixed(4)}) rotateZ(${pose.tilt.toFixed(2)}deg)`
      const body = bodyRef.current
      if (body) body.style.transform = `${lift} rotateY(${pose.angle.toFixed(2)}deg)`
      const g1 = ghost1Ref.current
      if (g1) {
        g1.style.transform = `${lift} rotateY(${pose.ghostAngle1.toFixed(2)}deg)`
        g1.style.opacity = (pose.ghostAlpha * 0.4).toFixed(3)
      }
      const g2 = ghost2Ref.current
      if (g2) {
        g2.style.transform = `${lift} rotateY(${pose.ghostAngle2.toFixed(2)}deg)`
        g2.style.opacity = (pose.ghostAlpha * 0.22).toFixed(3)
      }
      if (shadeRef.current) shadeRef.current.style.opacity = pose.shade.toFixed(3)
      const shadow = shadowRef.current
      if (shadow) {
        shadow.style.transform = `translateX(-50%) scale(${pose.shadowScale.toFixed(3)}, 1)`
        shadow.style.opacity = Math.max(0, pose.shadowAlpha).toFixed(3)
      }
      const glow = glowRef.current
      if (glow) {
        glow.style.transform = `translate(-50%, -50%) scale(${(0.82 + 0.38 * pose.glow).toFixed(3)})`
        glow.style.opacity = Math.min(1, 0.2 + 0.8 * pose.glow).toFixed(3)
      }
      const ring = ringRef.current
      if (ring) {
        ring.style.transform = `translateX(-50%) scale(${(1 + 0.16 * pose.ring).toFixed(3)})`
        ring.style.opacity = pose.ringAlpha.toFixed(3)
      }
      if (blobsRef.current) blobsRef.current.style.opacity = pose.blobs.toFixed(3)
      if (beamsRef.current) beamsRef.current.style.opacity = pose.beams.toFixed(3)
      if (flashRef.current) flashRef.current.style.opacity = pose.flash.toFixed(3)

      particles.frame({
        dt,
        now,
        events: choreo.events,
        fade: pose.fade,
        intensity: Math.min(1, pose.glow),
        reducedMotion: reduced,
        spectrum: live ? levels.spectrum : null,
      })

      const duration = engine.duration
      const progress = Math.min(1, Math.max(0, songTime / duration))
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress.toFixed(4)})`
      const second = Math.floor(songTime)
      if (second !== lastSecond && timeRef.current) {
        lastSecond = second
        timeRef.current.textContent = `${fmt(second)} / ${fmt(duration)}`
      }
    }

    const onResize = () => {
      particles.resize()
      measure()
    }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null
    ro?.observe(canvas)
    window.addEventListener('orientationchange', onResize)
    onResize()
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      window.removeEventListener('orientationchange', onResize)
      particles.dispose()
    }
  }, [engine])

  // Put keyboard focus on the start button when it appears (if nothing else has it).
  const gate = state.phase === 'ready' ? state.gate : null
  useEffect(() => {
    if (gate !== 'blocked') return
    const active = document.activeElement
    if (!active || active === document.body) startRef.current?.focus({ preventScroll: true })
  }, [gate])

  const playing = state.phase === 'playing'
  const paused = playing && state.paused
  const buffering = playing && state.buffering
  const starting = gate === 'starting'

  return (
    <section
      className={`rave rave--${mode}${gate ? ' rave--gate' : ''}${reducedMotion ? ' rave--calm' : ''}`}
      aria-label="OIIA cat rave"
    >
      <div className="rave__bg" aria-hidden="true">
        <div className="rave__blobs" ref={blobsRef}>
          <span className="blob blob--pink" />
          <span className="blob blob--violet" />
          <span className="blob blob--cyan" />
        </div>
        <div className="rave__beams" ref={beamsRef} />
      </div>

      <canvas className="rave__particles" ref={canvasRef} aria-hidden="true" />

      <div className="rave__layout">
        <header className="rave__top">
          <h1 className="brand">
            <span className="brand__oiia">OIIA</span> <span className="brand__rest">Cat Rave</span>
          </h1>
          <div className="rave__controls">
            {playing && (
              <button
                type="button"
                className="icon-btn"
                onClick={paused ? onResume : onPause}
                aria-label={paused ? 'Resume music' : 'Pause music'}
              >
                {paused ? <PlayIcon /> : <PauseIcon />}
              </button>
            )}
            {state.phase !== 'transitioning' && (
              <button
                type="button"
                className="pill-btn skip-btn"
                onClick={onSkip}
                aria-label="Skip intro and go to the coffee"
              >
                Skip Intro <SkipIcon />
              </button>
            )}
          </div>
        </header>

        <div className="rave__stage-wrap">
          <div className="cat-stage" ref={stageRef}>
            <div className="rave__glow" ref={glowRef} aria-hidden="true" />
            <div className="stage-ring" ref={ringRef} aria-hidden="true" />
            <SpinningCat
              bodyRef={bodyRef}
              ghost1Ref={ghost1Ref}
              ghost2Ref={ghost2Ref}
              shadeRef={shadeRef}
              shadowRef={shadowRef}
            />
          </div>

          <div className="rave__gate">
            {(gate === 'blocked' || gate === 'starting') && (
              <>
                <button
                  type="button"
                  ref={startRef}
                  className={`start-btn${starting ? ' is-busy' : ''}`}
                  onClick={starting ? undefined : onStart}
                  aria-disabled={starting || undefined}
                  aria-busy={starting || undefined}
                >
                  {starting ? (
                    <>
                      <span className="spinner" aria-hidden="true" /> Cueing the beat…
                    </>
                  ) : (
                    <>
                      Tap to Start the Rave <span aria-hidden="true">🎵</span>
                    </>
                  )}
                </button>
                <p className="gate-hint">Sound on 🔊 · one minute of pure spin</p>
              </>
            )}
            {gate === 'checking' && <p className="gate-hint gate-hint--delayed">Warming up the speakers…</p>}
            {gate === 'error' && (
              <div className="gate-error" role="alert">
                <p>
                  <span aria-hidden="true">😿</span> The soundtrack couldn’t load, so the rave can’t start.
                </p>
                <div className="gate-error__actions">
                  <button type="button" className="pill-btn" onClick={onStart}>
                    Try again
                  </button>
                  <button type="button" className="pill-btn pill-btn--ghost" onClick={onSkip}>
                    Skip to coffee <span aria-hidden="true">☕</span>
                  </button>
                </div>
              </div>
            )}
            {paused && (
              <button type="button" className="start-btn start-btn--resume" onClick={onResume}>
                <PlayIcon /> Resume the Rave
              </button>
            )}
            {buffering && <p className="gate-chip">Buffering the beat…</p>}
          </div>
        </div>

        <footer className="rave__bottom" aria-hidden="true">
          <div className="progress">
            <div className="progress__fill" ref={progressRef} />
          </div>
          <span className="progress__time" ref={timeRef}>
            0:00 / 1:00
          </span>
        </footer>
      </div>

      <div className="rave__flash" ref={flashRef} aria-hidden="true" />
      <div className="rave__vignette" aria-hidden="true" />
    </section>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="6" y="5" width="4.2" height="14" rx="1.6" fill="currentColor" />
      <rect x="13.8" y="5" width="4.2" height="14" rx="1.6" fill="currentColor" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M8 5.6v12.8a1 1 0 0 0 1.52.85l10.2-6.4a1 1 0 0 0 0-1.7L9.52 4.75A1 1 0 0 0 8 5.6Z" fill="currentColor" />
    </svg>
  )
}

function SkipIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 6.2v11.6a.8.8 0 0 0 1.24.67L13 13.3v4.5a.8.8 0 0 0 1.24.67l8.4-5.8a.8.8 0 0 0 0-1.34l-8.4-5.8A.8.8 0 0 0 13 6.2v4.5L5.24 5.53A.8.8 0 0 0 4 6.2Z" fill="currentColor" />
    </svg>
  )
}
