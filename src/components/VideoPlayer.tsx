import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react'
import { useInView } from '../hooks/useInView'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { FullscreenIcon, PauseIcon, PlayIcon, ReplayIcon, SoundIcon } from './primitives'
import './VideoPlayer.css'

type Mode = 'preview' | 'playing' | 'paused' | 'ended' | 'error'

interface Props {
  src: string
  poster: string
  title: string
}

const formatTime = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

/** Seconds into the footage where the muted preview begins. */
const PREVIEW_START = 14

interface WebkitVideo extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void
}

/**
 * One <video> element does two jobs: a muted, looping preview while it is on
 * screen, and the full feature with sound once the visitor presses play.
 * Sound only ever starts from a user gesture, playback pauses when the player
 * leaves the viewport or the tab is hidden, and there is never a second
 * media element playing alongside it.
 */
export function VideoPlayer({ src, poster, title }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideTimer = useRef(0)
  const playBtnRef = useRef<HTMLButtonElement>(null)
  const focusControls = useRef(false)
  const reduced = useReducedMotion()
  const inView = useInView(wrapRef, { threshold: 0.35 })
  // Don't touch the 8 MB file until the visitor is within a screen of the player.
  const near = useInView(wrapRef, { rootMargin: '100% 0px', once: true })

  const [mode, setMode] = useState<Mode>('preview')
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [idle, setIdle] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const featured = mode === 'playing' || mode === 'paused' || mode === 'ended'

  // Muted preview: plays only while visible, never for reduced-motion visitors.
  useEffect(() => {
    const video = videoRef.current
    if (!video || mode !== 'preview') return
    if (inView && !reduced) {
      video.muted = true
      video.loop = true
      // Open the preview on the full-frame part of the footage.
      if (video.currentTime < 1) video.currentTime = PREVIEW_START
      video.play().catch(() => {
        /* Autoplay refused: the poster and play button remain. */
      })
    } else {
      video.pause()
    }
  }, [inView, mode, reduced])

  // Feature playback pauses when scrolled away (unless fullscreen).
  useEffect(() => {
    const video = videoRef.current
    if (!video || mode !== 'playing' || inView || fullscreen) return
    video.pause()
  }, [inView, mode, fullscreen])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) videoRef.current?.pause()
    }
    const onFullscreen = () => setFullscreen(document.fullscreenElement === wrapRef.current)
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('fullscreenchange', onFullscreen)
    }
  }, [])

  // When the overlay's play button disappears, hand keyboard focus to the controls.
  useEffect(() => {
    if (focusControls.current && (mode === 'playing' || mode === 'paused')) {
      focusControls.current = false
      playBtnRef.current?.focus()
    }
  }, [mode])

  const startFeature = () => {
    const video = videoRef.current
    if (!video) return
    video.loop = false
    video.muted = false
    setMuted(false)
    video.currentTime = 0
    setMode('playing')
    video.play().catch(() => setMode('paused'))
  }

  const startFromOverlay = () => {
    focusControls.current = true
    startFeature()
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (mode === 'preview' || mode === 'ended') return startFeature()
    if (video.paused) {
      video.play().catch(() => setMode('paused'))
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  const seek = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const t = Number(event.target.value)
    video.currentTime = t
    setTime(t)
    if (mode === 'ended') setMode('paused')
  }

  const toggleFullscreen = async () => {
    const wrap = wrapRef.current
    const video = videoRef.current as WebkitVideo | null
    if (!wrap || !video) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (wrap.requestFullscreen) {
        await wrap.requestFullscreen()
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen() // iOS Safari
      }
    } catch {
      /* Fullscreen refused; nothing else to do. */
    }
  }

  // Auto-hide the control bar while playing and the pointer is still.
  const wake = () => {
    setIdle(false)
    window.clearTimeout(hideTimer.current)
    if (mode === 'playing') hideTimer.current = window.setTimeout(() => setIdle(true), 2600)
  }

  useEffect(() => {
    if (mode !== 'playing') window.clearTimeout(hideTimer.current)
    return () => window.clearTimeout(hideTimer.current)
  }, [mode])

  const controlsHidden = idle && mode === 'playing'

  const progress = duration ? time / duration : 0

  return (
    <div
      ref={wrapRef}
      className="player"
      data-mode={mode}
      data-idle={controlsHidden ? '' : undefined}
      onPointerMove={wake}
      onFocusCapture={wake}
    >
      <video
        ref={videoRef}
        className="player__video"
        src={src}
        poster={poster}
        playsInline
        preload={near ? 'auto' : 'none'}
        muted
        loop
        aria-label={title}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => featured && setTime(e.currentTarget.currentTime)}
        onPlay={() => featured && setMode('playing')}
        onPause={() => mode === 'playing' && setMode('paused')}
        onEnded={() => setMode('ended')}
        onError={() => setMode('error')}
        onClick={featured ? togglePlay : undefined}
      />

      {/* Preview / ended overlay */}
      {(mode === 'preview' || mode === 'ended') && (
        <div className="player__overlay">
          <div className="player__overlay-top mono">
            <span>
              <span className="dot dot--live" aria-hidden="true" /> {mode === 'preview' ? 'Muted preview' : 'End of footage'}
            </span>
            <span>File 0001 · {duration ? formatTime(duration) : '—:——'}</span>
          </div>
          <button
            type="button"
            className="player__big-play"
            onClick={startFromOverlay}
            aria-label={mode === 'ended' ? 'Replay the incident with sound' : 'Play the incident with sound'}
          >
            <span className="player__big-play-ring" aria-hidden="true" />
            <span className="player__big-play-icon" aria-hidden="true">
              {mode === 'ended' ? <ReplayIcon size={22} /> : <PlayIcon size={22} />}
            </span>
            <span className="player__big-play-label mono" aria-hidden="true">
              {mode === 'ended' ? 'Replay' : 'Play with sound'}
            </span>
          </button>
          <p className="player__overlay-title display" aria-hidden="true">
            Rotational <em>Excellence</em>
          </p>
        </div>
      )}

      {mode === 'error' && (
        <div className="player__overlay player__overlay--error" role="alert">
          <p className="display">The footage could not be loaded.</p>
          <p className="muted">The incident remains, officially, unconfirmed.</p>
          <a className="link" href={src} target="_blank" rel="noopener">
            <span className="link__text">Open the video file directly</span>
          </a>
        </div>
      )}

      {/* Controls */}
      {featured && (
        <div className="player__controls" role="group" aria-label="Video controls">
          <button
            ref={playBtnRef}
            type="button"
            className="player__btn"
            onClick={togglePlay}
            aria-label={mode === 'playing' ? 'Pause' : 'Play'}
          >
            {mode === 'playing' ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button type="button" className="player__btn" onClick={startFeature} aria-label="Replay from the start">
            <ReplayIcon />
          </button>

          <span className="player__time mono tnum" aria-hidden="true">
            {formatTime(time)}
          </span>
          <label className="player__scrub" style={{ '--p': progress } as CSSProperties}>
            <span className="sr-only">Seek</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={time}
              onChange={seek}
              aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
            />
          </label>
          <span className="player__time mono tnum" aria-hidden="true">
            {formatTime(duration)}
          </span>

          <button type="button" className="player__btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
            <SoundIcon muted={muted} />
          </button>
          <button
            type="button"
            className="player__btn"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <FullscreenIcon />
          </button>
        </div>
      )}
    </div>
  )
}
