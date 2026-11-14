import { TRACK_DURATION_FALLBACK } from '../config'

export type PlayResult = 'playing' | 'blocked' | 'aborted' | 'error'

export interface AudioEngineEvents {
  onPlaying(): void
  onPause(): void
  onWaiting(): void
  onEnded(): void
  onError(): void
}

/** Live analysis of the soundtrack, all values 0..1. */
export interface LiveLevels {
  bass: number
  mid: number
  high: number
  energy: number
  /** Log-spaced bands from ~40 Hz to ~14 kHz. */
  spectrum: Float32Array
}

export const SPECTRUM_BANDS = 32

type AudioContextCtor = typeof AudioContext

/**
 * Owns the single <audio> element for the soundtrack plus an optional Web
 * Audio analyser.
 *
 * Lifecycle: the object itself is inert; `attach()` creates the element and
 * `detach()` tears everything down (pauses, drops the source, closes the
 * AudioContext). That makes it safe under React StrictMode's double effects
 * and guarantees there is never more than one copy of the song.
 *
 * The element is only routed through the AudioContext once the context is
 * actually `running`. Routing it through a suspended context would make the
 * element "play" in silence, which is exactly the fake-playback state we must
 * never show. Without a running context the music still plays directly and
 * the visuals fall back to the pre-measured beat map.
 */
export class RaveAudioEngine {
  private readonly src: string
  private readonly events: AudioEngineEvents
  private audio: HTMLAudioElement | null = null
  private ctx: AudioContext | null = null
  private source: MediaElementAudioSourceNode | null = null
  private analyser: AnalyserNode | null = null
  private bins: Uint8Array<ArrayBuffer> | null = null
  private bandRanges: Array<[number, number]> = []
  private bassRange: [number, number] = [1, 6]
  private midRange: [number, number] = [10, 90]
  private highRange: [number, number] = [120, 520]
  private playbackAllowed = true
  private unlockArmed = false

  constructor(src: string, events: AudioEngineEvents) {
    this.src = src
    this.events = events
  }

  attach(): void {
    if (this.audio) return
    const audio = new Audio()
    audio.preload = 'auto'
    audio.src = this.src
    audio.addEventListener('playing', this.handlePlaying)
    audio.addEventListener('pause', this.handlePause)
    audio.addEventListener('waiting', this.handleWaiting)
    audio.addEventListener('ended', this.handleEnded)
    audio.addEventListener('error', this.handleError)
    this.audio = audio
    this.playbackAllowed = true
  }

  detach(): void {
    const audio = this.audio
    if (!audio) return
    this.audio = null
    audio.removeEventListener('playing', this.handlePlaying)
    audio.removeEventListener('pause', this.handlePause)
    audio.removeEventListener('waiting', this.handleWaiting)
    audio.removeEventListener('ended', this.handleEnded)
    audio.removeEventListener('error', this.handleError)
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    this.disarmUnlock()
    try {
      this.source?.disconnect()
      this.analyser?.disconnect()
    } catch {
      /* already disconnected */
    }
    if (this.ctx) {
      this.ctx.removeEventListener('statechange', this.handleContextState)
      this.ctx.close().catch(() => {})
    }
    this.ctx = null
    this.source = null
    this.analyser = null
    this.bins = null
  }

  get currentTime(): number {
    return this.audio?.currentTime || 0
  }

  get duration(): number {
    const d = this.audio?.duration ?? NaN
    return Number.isFinite(d) && d > 0 ? d : TRACK_DURATION_FALLBACK
  }

  get isPlaying(): boolean {
    return !!this.audio && !this.audio.paused && !this.audio.ended
  }

  /** True when real-time analysis is wired up and running. */
  get hasAnalysis(): boolean {
    return this.analyser !== null && this.ctx?.state === 'running'
  }

  /**
   * Start or resume playback. When called from a user gesture we also unlock
   * the AudioContext in the same call stack, which iOS Safari requires.
   */
  async play({ gesture, fromStart }: { gesture: boolean; fromStart: boolean }): Promise<PlayResult> {
    const audio = this.audio
    if (!audio) return 'aborted'
    this.playbackAllowed = true
    if (audio.error) audio.load() // retry after a failed load
    if (fromStart) seek(audio, 0)
    if (gesture) this.unlockContext()

    try {
      await audio.play()
    } catch (err) {
      if (this.audio !== audio) return 'aborted'
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError') return 'blocked'
      if (name === 'AbortError') return 'aborted'
      return 'error'
    }

    if (this.audio !== audio) return 'aborted'
    if (!gesture) this.unlockContext() // only connects if the browser lets the context run
    return 'playing'
  }

  pause(): void {
    this.audio?.pause()
  }

  /** Stop and rewind. Used by Skip Intro. */
  stop(): void {
    this.playbackAllowed = false
    if (!this.audio) return
    this.audio.pause()
    seek(this.audio, 0)
  }

  /**
   * When false, any playback that starts outside our own play() calls (for
   * example hardware media keys on the coffee screen) is stopped right away.
   */
  setPlaybackAllowed(allowed: boolean): void {
    this.playbackAllowed = allowed
    if (!allowed && this.audio && !this.audio.paused) this.audio.pause()
  }

  /** Fill `out` with the current analysis. Returns false when unavailable. */
  readLevels(out: LiveLevels): boolean {
    const { analyser, bins, ctx, audio } = this
    if (!analyser || !bins || !ctx || !audio || ctx.state !== 'running' || audio.paused) return false
    analyser.getByteFrequencyData(bins)

    out.bass = average(bins, this.bassRange) / 255
    out.mid = average(bins, this.midRange) / 255
    out.high = average(bins, this.highRange) / 255
    out.energy = Math.min(1, out.bass * 0.5 + out.mid * 0.32 + out.high * 0.4)

    const ranges = this.bandRanges
    for (let i = 0; i < ranges.length; i++) {
      const v = average(bins, ranges[i]) / 255
      out.spectrum[i] = v * v * (1 + i / ranges.length) // emphasise peaks, lift the highs a bit
    }
    return true
  }

  // ---------------------------------------------------------------- internals

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx
    const w = window as Window & { webkitAudioContext?: AudioContextCtor }
    const Ctor: AudioContextCtor | undefined = window.AudioContext ?? w.webkitAudioContext
    if (!Ctor) return null

    // iOS: let Web Audio play even when the ringer switch is on silent.
    const nav = navigator as Navigator & { audioSession?: { type: string } }
    if (nav.audioSession) {
      try {
        nav.audioSession.type = 'playback'
      } catch {
        /* unsupported */
      }
    }

    try {
      this.ctx = new Ctor({ latencyHint: 'interactive' })
    } catch {
      return null
    }
    this.ctx.addEventListener('statechange', this.handleContextState)
    return this.ctx
  }

  private unlockContext() {
    const ctx = this.ensureContext()
    if (!ctx) return
    if (ctx.state === 'running') {
      this.connectGraph()
      return
    }
    ctx.resume().then(
      () => this.connectGraph(),
      () => {},
    )
    // If this was not a user gesture the resume may stay pending; try again
    // on the next interaction anywhere on the page.
    this.armUnlock()
  }

  private connectGraph() {
    const { ctx, audio } = this
    if (!ctx || !audio || this.source || ctx.state !== 'running') return
    let source: MediaElementAudioSourceNode
    try {
      source = ctx.createMediaElementSource(audio)
    } catch {
      return // element keeps playing directly; visuals use the beat map only
    }
    this.source = source
    try {
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.55
      analyser.minDecibels = -90
      analyser.maxDecibels = -18
      source.connect(analyser)
      analyser.connect(ctx.destination)
      this.analyser = analyser
      this.bins = new Uint8Array(analyser.frequencyBinCount)
      this.computeRanges(ctx.sampleRate, analyser.fftSize)
    } catch {
      // Never leave the element routed into nothing.
      try {
        source.connect(ctx.destination)
      } catch {
        /* nothing else we can do */
      }
      this.analyser = null
    }
    this.disarmUnlock()
  }

  private computeRanges(sampleRate: number, fftSize: number) {
    const hzPerBin = sampleRate / fftSize
    const maxBin = fftSize / 2 - 1
    const bin = (hz: number) => Math.max(1, Math.min(maxBin, Math.round(hz / hzPerBin)))
    this.bassRange = [bin(35), bin(150)]
    this.midRange = [bin(250), bin(2000)]
    this.highRange = [bin(3000), bin(12000)]

    const lo = Math.log(40)
    const hi = Math.log(14000)
    const ranges: Array<[number, number]> = []
    for (let i = 0; i < SPECTRUM_BANDS; i++) {
      const a = bin(Math.exp(lo + ((hi - lo) * i) / SPECTRUM_BANDS))
      const b = bin(Math.exp(lo + ((hi - lo) * (i + 1)) / SPECTRUM_BANDS))
      ranges.push([a, Math.max(a, b)])
    }
    this.bandRanges = ranges
  }

  private armUnlock() {
    if (this.unlockArmed) return
    this.unlockArmed = true
    window.addEventListener('pointerdown', this.handleUnlockGesture, true)
    window.addEventListener('keydown', this.handleUnlockGesture, true)
  }

  private disarmUnlock() {
    if (!this.unlockArmed) return
    this.unlockArmed = false
    window.removeEventListener('pointerdown', this.handleUnlockGesture, true)
    window.removeEventListener('keydown', this.handleUnlockGesture, true)
  }

  private handleUnlockGesture = () => {
    const ctx = this.ctx
    if (!ctx || this.source) {
      this.disarmUnlock()
      return
    }
    ctx.resume().then(
      () => {
        if (this.isPlaying) this.connectGraph()
      },
      () => {},
    )
  }

  private handleContextState = () => {
    const { ctx, audio } = this
    if (!ctx || !audio) return
    if (ctx.state === 'running') {
      if (this.isPlaying) this.connectGraph()
      return
    }
    // Suspended or interrupted (e.g. a phone call on iOS). If the element is
    // routed through the graph it would keep "playing" with no sound, so
    // pause it for real and let the UI show the paused state.
    if (this.source && !audio.paused) audio.pause()
  }

  private handlePlaying = () => {
    if (!this.playbackAllowed) {
      this.audio?.pause()
      return
    }
    this.events.onPlaying()
  }

  private handlePause = () => {
    if (this.audio?.ended) return // `ended` follows; don't flash a paused state
    this.events.onPause()
  }

  private handleWaiting = () => this.events.onWaiting()
  private handleEnded = () => this.events.onEnded()
  private handleError = () => this.events.onError()
}

function seek(audio: HTMLAudioElement, time: number) {
  try {
    audio.currentTime = time
  } catch {
    /* not seekable yet; it starts at 0 anyway */
  }
}

function average(bins: Uint8Array, [a, b]: [number, number]): number {
  let sum = 0
  for (let i = a; i <= b; i++) sum += bins[i]
  return sum / (b - a + 1)
}
