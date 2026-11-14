import type { LiveLevels } from '../audio/RaveAudioEngine'
import { DROPS, KICK_RANGES, SECTIONS, TRACK, type Section } from '../config'

export type RaveMode = 'idle' | 'playing' | 'paused' | 'winddown'

export interface FrameInput {
  /** Seconds since last frame (already clamped). */
  dt: number
  /** Wall-clock seconds, for idle motion that should not depend on the song. */
  now: number
  mode: RaveMode
  /** `audio.currentTime` — the single source of truth for musical timing. */
  songTime: number
  reducedMotion: boolean
  live: LiveLevels | null
}

/** Things that happened this frame, consumed by the particle system. */
export type ChoreoEvent = 'kick' | 'downbeat' | 'drop' | 'word'

export interface Pose {
  /** rotateY of the cat card, degrees. */
  angle: number
  ghostAngle1: number
  ghostAngle2: number
  ghostAlpha: number
  /** rotateZ wobble, degrees. */
  tilt: number
  /** Jump height as a fraction of the cat's height. */
  hop: number
  scaleX: number
  scaleY: number
  /** Darkening overlay when the card is edge-on or showing its back. */
  shade: number
  shadowScale: number
  shadowAlpha: number
  glow: number
  beams: number
  blobs: number
  ring: number
  ringAlpha: number
  flash: number
  /** 0..1 overall fade used by background layers during wind-down. */
  fade: number
}

const BEAT = 60 / TRACK.bpm

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)
const mod = (n: number, m: number) => ((n % m) + m) % m
/** Frame-rate independent exponential approach. */
const approach = (current: number, target: number, dt: number, tau: number) =>
  current + (target - current) * (1 - Math.exp(-dt / tau))

export function sectionAt(t: number): Section {
  let found = SECTIONS[0]
  for (const s of SECTIONS) {
    if (t >= s.start) found = s
    else break
  }
  return found
}

const hasKick = (t: number) => KICK_RANGES.some(([a, b]) => t >= a && t < b)

/** Spin direction flips every 4 bars, so the cat changes direction now and then. */
function directionAt(beatIndex: number) {
  const phrase = Math.floor((beatIndex - TRACK.barAnchorBeat) / 16)
  return phrase < 0 || phrase % 2 === 0 ? 1 : -1
}

/** Nearest "facing the camera" angle ahead of the current motion. */
function frontAhead(angle: number, omega: number) {
  const ahead = angle + omega * 0.3
  return omega >= 0 ? Math.ceil(ahead / 360) * 360 : Math.floor(ahead / 360) * 360
}

/**
 * Turns song time + live audio levels into a pose for the cat and the
 * scene. All motion is physically smoothed so mode switches (idle → rave →
 * pause → wind-down) blend instead of snapping.
 */
export class Choreographer {
  readonly events: ChoreoEvent[] = []
  readonly pose: Pose = {
    angle: 0,
    ghostAngle1: 0,
    ghostAngle2: 0,
    ghostAlpha: 0,
    tilt: 0,
    hop: 0,
    scaleX: 1,
    scaleY: 1,
    shade: 0,
    shadowScale: 1,
    shadowAlpha: 0.6,
    glow: 0.3,
    beams: 0.1,
    blobs: 0.5,
    ring: 0,
    ringAlpha: 0.3,
    flash: 0,
    fade: 1,
  }

  private angle = 0
  private omega = 0 // deg/s
  private settleTarget: number | null = null
  private tilt = 0
  private tiltV = 0
  private sway = 1
  private raveMix = 0
  private fade = 1
  private hopAmp = 0
  private glow = 0.3
  private beams = 0.08
  private beatPulse = 0
  private accent = 0
  private flash = 0
  private dizzy = 0
  private bass = 0
  private high = 0
  private energy = 0
  private lastBeat = Number.NEGATIVE_INFINITY
  private mode: RaveMode = 'idle'

  update(input: FrameInput): Pose {
    const { dt, now, mode, songTime: t, reducedMotion: rm, live } = input
    this.events.length = 0

    if (mode !== this.mode) {
      if (mode === 'winddown') {
        this.dizzy = 1
        if (!rm) this.tiltV += 90 * Math.sign(this.omega || 1)
      }
      this.mode = mode
    }

    const playing = mode === 'playing'
    const musical = playing || mode === 'paused'
    this.raveMix = approach(this.raveMix, playing ? 1 : 0, dt, playing ? 0.3 : 0.5)
    this.fade = approach(this.fade, mode === 'winddown' ? 0 : 1, dt, 0.4)

    // ---- live audio levels: quick attack, slower release
    if (live) {
      this.bass = follow(this.bass, live.bass, dt)
      this.high = follow(this.high, live.high, dt)
      this.energy = follow(this.energy, live.energy, dt)
    } else {
      this.bass = approach(this.bass, 0, dt, 0.4)
      this.high = approach(this.high, 0, dt, 0.4)
      this.energy = approach(this.energy, 0, dt, 0.4)
    }
    const hasLive = live !== null
    const section = sectionAt(t)

    // ---- beat clock (from audio.currentTime, so pause/seek safe)
    const beatPos = (t - TRACK.firstBeat) / BEAT
    const beatIdx = Math.floor(beatPos)
    const phase = beatPos - beatIdx
    if (playing && beatPos >= 0 && beatIdx !== this.lastBeat) {
      this.lastBeat = beatIdx
      this.onBeat(beatIdx, rm)
    }
    const dir = directionAt(beatIdx)

    // ---- spin: either chase a target speed or settle facing the camera
    let spinTarget: number | null = null
    if (playing && !rm && section.spin > 0) {
      const liveBoost = hasLive ? 0.85 + 0.35 * this.energy : 1
      spinTarget = section.spin * 360 * dir * liveBoost
    }
    if (spinTarget !== null) {
      this.settleTarget = null
      this.omega = approach(this.omega, spinTarget, dt, 0.28)
      this.angle += this.omega * dt
    } else {
      if (this.settleTarget === null) this.settleTarget = frontAhead(this.angle, this.omega)
      // Critically damped spring: brakes smoothly, never overshoots.
      const w = 7.5
      const e = this.angle - this.settleTarget
      this.omega += (-w * w * e - 2 * w * this.omega) * dt
      this.angle += this.omega * dt
    }
    if (Math.abs(this.angle) > 7200) {
      const k = Math.trunc(this.angle / 360) * 360
      this.angle -= k
      if (this.settleTarget !== null) this.settleTarget -= k
    }

    // Gentle side-to-side sway while waiting/paused, and as the reduced-motion "dance".
    this.sway = approach(this.sway, mode === 'idle' || mode === 'paused' ? 1 : 0, dt, 0.5)
    let swayAngle = this.sway * 22 * Math.sin(now * 1.7)
    if (rm && playing && beatPos >= 0) swayAngle += 14 * Math.sin((Math.PI * beatPos) / 2)
    const display = this.angle + swayAngle

    // ---- wobble (rotateZ): an underdamped spring kicked by musical events
    this.tiltV += (-170 * this.tilt - 3.2 * this.tiltV) * dt
    this.tilt = clamp(this.tilt + this.tiltV * dt, -14, 14)
    this.dizzy = mode === 'winddown' ? approach(this.dizzy, 0, dt, 1.1) : 0
    const tilt = rm ? 0 : this.tilt + this.dizzy * 7 * Math.sin(now * 6.5)

    // ---- hop + squash & stretch, one jump per beat
    let hopTarget = 0
    if (playing && !rm) {
      if (section.kind === 'drop') hopTarget = 1
      else if (section.kind === 'outro') hopTarget = 0.75
      else if (section.kind === 'fade') hopTarget = 0.35
      else if (section.kind === 'intro' && section.spin > 0) hopTarget = 0.35
      if (hasLive) hopTarget *= 0.7 + 0.5 * this.bass
    }
    this.hopAmp = approach(this.hopAmp, hopTarget, dt, 0.15)
    const onBeatGrid = beatPos >= 0
    const u = (phase - 0.1) / 0.9
    const jump = onBeatGrid && phase >= 0.1 ? 4 * u * (1 - u) : 0
    const idleBob = rm ? 0 : (1 - this.raveMix) * 0.012 * (0.5 + 0.5 * Math.sin(now * 2.3))
    const hop = this.hopAmp * 0.075 * jump + idleBob
    const squash = onBeatGrid && phase < 0.1 ? (1 - phase / 0.1) * this.hopAmp : 0
    const stretch =
      onBeatGrid && phase >= 0.1 && phase < 0.35
        ? Math.sin((Math.PI * (phase - 0.1)) / 0.25) * this.hopAmp
        : 0
    const breathe = (1 - this.raveMix) * 0.012 * Math.sin(now * 2.3 + 1)
    const pulse = 1 + 0.055 * this.accent + 0.03 * this.beatPulse

    // ---- light & background levels
    const sectionLevel = musical ? section.level : 0.3
    const liveLevel = hasLive ? 0.55 + 0.65 * this.energy : 1
    const glowTarget = mode === 'paused' ? 0.22 : playing ? sectionLevel * liveLevel : 0.3
    this.glow = approach(this.glow, glowTarget, dt, 0.25)
    const beamsTarget =
      playing && section.kind === 'drop'
        ? 0.5 + (hasLive ? 0.45 * this.high : 0.25)
        : playing
          ? 0.15
          : 0.08
    this.beams = approach(this.beams, beamsTarget, dt, 0.4)

    this.beatPulse *= Math.exp(-dt / 0.13)
    this.accent *= Math.exp(-dt / 0.28)
    this.flash *= Math.exp(-dt / 0.16)

    // ---- write pose
    const rad = (display * Math.PI) / 180
    const cos = Math.cos(rad)
    const facing = Math.abs(cos)
    const speed = Math.abs(this.omega)
    const p = this.pose
    p.angle = display
    p.ghostAlpha = rm ? 0 : clamp((speed - 300) / 700, 0, 1)
    p.ghostAngle1 = display - this.omega * 0.022
    p.ghostAngle2 = display - this.omega * 0.045
    p.tilt = tilt
    p.hop = hop
    p.scaleX = pulse * (1 + 0.075 * squash - 0.025 * stretch + breathe)
    p.scaleY = pulse * (1 - 0.09 * squash + 0.035 * stretch + breathe)
    p.shade = 0.55 * Math.pow(1 - facing, 1.3) + (cos < 0 ? 0.08 : 0)
    p.shadowScale = (0.6 + 0.4 * facing) * (1 - 4 * hop)
    p.shadowAlpha = 0.65 * (1 - 5 * hop)
    p.glow = clamp(this.fade * (this.glow + 0.28 * this.beatPulse + 0.25 * this.accent), 0, 1.3)
    p.beams = this.fade * this.beams * (1 + 0.3 * this.beatPulse)
    p.blobs = this.fade * (0.45 + 0.55 * this.glow)
    p.ring = this.fade * (0.5 * this.beatPulse + 0.5 * this.accent)
    p.ringAlpha = this.fade * (0.3 + 0.5 * this.glow)
    p.flash = rm ? 0 : this.flash * this.fade
    p.fade = this.fade
    return p
  }

  private onBeat(i: number, rm: boolean) {
    const tb = TRACK.firstBeat + i * BEAT
    const barBeat = mod(i - TRACK.barAnchorBeat, 4)
    const sec = sectionAt(tb + 0.01)
    const dir = directionAt(i)

    if (DROPS.some((d) => Math.abs(d - tb) < 0.06)) {
      this.events.push('drop')
      this.beatPulse = 1
      this.accent = 1
      if (!rm) {
        this.flash = Math.max(this.flash, 0.5)
        this.omega += dir * 540
        this.tiltV += dir * 150
      }
      return
    }

    if (hasKick(tb + 0.01)) {
      this.beatPulse = 1
      if (barBeat !== 0) {
        this.events.push('kick')
        return
      }
      this.events.push('downbeat')
      this.accent = Math.max(this.accent, 0.65)
      if (!rm && sec.kind === 'drop') {
        this.flash = Math.max(this.flash, 0.14)
        this.omega += dir * 220
      }
      if (!rm && mod(i - TRACK.barAnchorBeat, 16) === 0) this.tiltV += dir * 140 // direction flip
      if (sec.kind === 'drop' && mod(i - TRACK.barAnchorBeat, 8) === 0) this.events.push('word')
      return
    }

    if (sec.kind === 'intro' && sec.spin > 0) this.beatPulse = 0.45 // vocal beats in the intro
  }
}

function follow(current: number, target: number, dt: number) {
  return approach(current, target, dt, target > current ? 0.04 : 0.22)
}
