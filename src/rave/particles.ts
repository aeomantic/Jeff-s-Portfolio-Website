import type { ChoreoEvent } from './choreography'

/**
 * A small canvas particle system: ambient twinkles, beat sparks, floating
 * paw prints / fish / notes, "OIIA" word pops and a spectrum strip.
 * Every sprite is pre-rendered once, so a frame is just drawImage calls.
 */

type Sprite = HTMLCanvasElement

interface Particle {
  kind: 'ambient' | 'spark' | 'float' | 'word'
  sprite: Sprite
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  rot: number
  vr: number
  seed: number
}

export interface FocusEllipse {
  x: number
  y: number
  rx: number
  ry: number
}

export interface ParticleFrame {
  dt: number
  now: number
  events: readonly ChoreoEvent[]
  /** Overall layer opacity (fades out during wind-down). */
  fade: number
  /** 0..1 musical intensity. */
  intensity: number
  reducedMotion: boolean
  spectrum: Float32Array | null
}

const PINK = '#ff4fd2'
const CYAN = '#4fe3ff'
const VIOLET = '#a77bff'
const BUTTER = '#fff3a8'
const WORDS = ['OIIA', 'OIIAI', 'IIAI!', 'OIIAIO', 'OOOO', 'OIIA!']
const MAX_PARTICLES = 170

export class ParticleField {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D | null
  private particles: Particle[] = []
  private w = 0
  private h = 0
  private dpr = 1
  private focus: FocusEllipse = { x: 0, y: 0, rx: 100, ry: 140 }
  private sparkles: Sprite[]
  private floaters: Sprite[]
  private words: Sprite[] = []
  private disposed = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.sparkles = [PINK, CYAN, VIOLET, BUTTER].map((c) => makeSparkle(c))
    this.floaters = [
      makePaw(PINK),
      makePaw(CYAN),
      makeFish(VIOLET),
      makeFish(CYAN),
      makeNote(BUTTER, '♪'),
      makeNote(PINK, '♫'),
    ]
    this.words = makeWords()
    // Re-render the word sprites once the display font is ready.
    document.fonts?.load("700 64px 'Fredoka Variable'").then(
      () => {
        if (!this.disposed) this.words = makeWords()
      },
      () => {},
    )
    this.resize()
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    this.w = Math.max(1, rect.width)
    this.h = Math.max(1, rect.height)
    const small = this.w * this.h < 500_000
    this.dpr = Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2)
    this.canvas.width = Math.round(this.w * this.dpr)
    this.canvas.height = Math.round(this.h * this.dpr)
  }

  setFocus(focus: FocusEllipse) {
    this.focus = focus
  }

  dispose() {
    this.disposed = true
    this.particles = []
  }

  frame(f: ParticleFrame) {
    const ctx = this.ctx
    if (!ctx) return
    this.handleEvents(f)
    this.topUpAmbient(f)
    this.step(f)
    this.draw(ctx, f)
  }

  // ---------------------------------------------------------------- spawning

  private handleEvents(f: ParticleFrame) {
    if (f.reducedMotion) return
    for (const e of f.events) {
      if (e === 'drop') {
        this.burst(34, 260, 520)
        this.word()
        this.word()
      } else if (e === 'downbeat') {
        this.burst(6, 150, 300)
        this.float()
      } else if (e === 'kick') {
        this.burst(3, 120, 240)
      } else if (e === 'word') {
        this.word()
      }
    }
  }

  private topUpAmbient(f: ParticleFrame) {
    const target = Math.round(clampN((this.w * this.h) / 42_000, 10, 30) * (f.reducedMotion ? 0.6 : 1))
    let count = 0
    for (const p of this.particles) if (p.kind === 'ambient') count++
    for (let i = count; i < target; i++) {
      const { x, y } = this.pointOutsideFocus()
      this.add({
        kind: 'ambient',
        sprite: pick(this.sparkles),
        x,
        y,
        vx: f.reducedMotion ? 0 : rand(-6, 6),
        vy: f.reducedMotion ? 0 : rand(-16, -5),
        life: 0,
        max: rand(5, 10),
        size: rand(8, 18),
        rot: rand(0, Math.PI),
        vr: f.reducedMotion ? 0 : rand(-0.4, 0.4),
        seed: Math.random() * 10,
      })
    }
  }

  private burst(n: number, minSpeed: number, maxSpeed: number) {
    const { x, y, rx, ry } = this.focus
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2)
      const speed = rand(minSpeed, maxSpeed)
      this.add({
        kind: 'spark',
        sprite: pick(this.sparkles),
        x: x + Math.cos(a) * rx * 0.85,
        y: y + Math.sin(a) * ry * 0.85,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 0,
        max: rand(0.55, 1.05),
        size: rand(10, 24),
        rot: rand(0, Math.PI),
        vr: rand(-4, 4),
        seed: 0,
      })
    }
  }

  private float() {
    const left = Math.random() < 0.5
    this.add({
      kind: 'float',
      sprite: pick(this.floaters),
      x: left ? rand(0.04, 0.24) * this.w : rand(0.76, 0.96) * this.w,
      y: this.h + 30,
      vx: rand(-10, 10),
      vy: rand(-110, -65),
      life: 0,
      max: rand(3.2, 4.6),
      size: rand(26, 40),
      rot: rand(-0.4, 0.4),
      vr: rand(-0.5, 0.5),
      seed: Math.random() * 10,
    })
  }

  private word() {
    const sprite = pick(this.words)
    const scale = clampN(this.w / 900, 0.55, 1.1)
    const halfW = (sprite.width / 2) * 0.5 * scale // sprites are rendered at 2x
    const { x, y, rx, ry } = this.focus
    // Pick a spot beside the cat (left or right, never by its feet), on screen.
    let px = x
    let py = y
    for (let tries = 0; tries < 8; tries++) {
      const deg = Math.random() < 0.5 ? rand(-65, 20) : rand(160, 245)
      const a = (deg * Math.PI) / 180
      const r = rand(1.05, 1.4)
      px = x + Math.cos(a) * (rx + halfW * 0.6) * r
      py = y + Math.sin(a) * ry * r * 0.9
      if (px > halfW + 8 && px < this.w - halfW - 8 && py > 70 && py < this.h - 90) break
    }
    this.add({
      kind: 'word',
      sprite,
      x: clampN(px, halfW + 8, this.w - halfW - 8),
      y: clampN(py, 70, this.h - 90),
      vx: 0,
      vy: -14,
      life: 0,
      max: 1.15,
      size: scale,
      rot: rand(-0.22, 0.22),
      vr: 0,
      seed: 0,
    })
  }

  private add(p: Particle) {
    if (this.particles.length >= MAX_PARTICLES) {
      const idx = this.particles.findIndex((q) => q.kind === 'spark')
      if (idx === -1) return
      this.particles.splice(idx, 1)
    }
    this.particles.push(p)
  }

  private pointOutsideFocus() {
    const { x, y, rx, ry } = this.focus
    for (let i = 0; i < 6; i++) {
      const px = rand(0, this.w)
      const py = rand(0, this.h)
      const dx = (px - x) / (rx * 1.1)
      const dy = (py - y) / (ry * 1.1)
      if (dx * dx + dy * dy > 1) return { x: px, y: py }
    }
    return { x: rand(0, this.w * 0.2), y: rand(0, this.h) }
  }

  // ---------------------------------------------------------------- simulate

  private step(f: ParticleFrame) {
    const { dt } = f
    const drag = Math.exp(-dt * 2.6)
    const keep: Particle[] = []
    for (const p of this.particles) {
      p.life += dt
      if (p.life >= p.max) continue
      if (p.kind === 'spark') {
        p.vx *= drag
        p.vy = p.vy * drag + 40 * dt
      } else if (p.kind === 'float') {
        p.vx = 18 * Math.sin(f.now * 1.6 + p.seed)
      }
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.rot += p.vr * dt
      if (p.kind === 'ambient' && (p.y < -30 || p.x < -30 || p.x > this.w + 30)) continue
      keep.push(p)
    }
    this.particles = keep
  }

  private draw(ctx: CanvasRenderingContext2D, f: ParticleFrame) {
    const { dpr } = this
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if (f.fade <= 0.01) return
    ctx.globalCompositeOperation = 'lighter'

    if (f.spectrum) this.drawSpectrum(ctx, f.spectrum, f.fade)

    for (const p of this.particles) {
      const t = p.life / p.max
      let alpha: number
      let scale: number
      if (p.kind === 'ambient') {
        const twinkle = 0.5 + 0.5 * Math.sin(f.now * 2.2 + p.seed * 3)
        alpha = (0.18 + 0.5 * twinkle) * edge(t, 0.15, 0.2) * (0.55 + 0.45 * f.intensity)
        scale = p.size / 32
      } else if (p.kind === 'spark') {
        alpha = 1 - t * t
        scale = (p.size / 32) * (1 - 0.4 * t)
      } else if (p.kind === 'float') {
        alpha = 0.8 * edge(t, 0.1, 0.25)
        scale = p.size / 64
      } else {
        alpha = t < 0.12 ? t / 0.12 : t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1
        const pop = t < 0.25 ? easeOutBack(t / 0.25) : 1 + 0.06 * (t - 0.25)
        scale = p.size * 0.5 * pop
      }
      alpha *= f.fade
      if (alpha <= 0.01) continue
      const c = Math.cos(p.rot) * scale * dpr
      const s = Math.sin(p.rot) * scale * dpr
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.setTransform(c, s, -s, c, p.x * dpr, p.y * dpr)
      ctx.drawImage(p.sprite, -p.sprite.width / 2, -p.sprite.height / 2)
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  private drawSpectrum(ctx: CanvasRenderingContext2D, spectrum: Float32Array, fade: number) {
    const { dpr, w, h } = this
    const n = spectrum.length
    const barW = w / (n * 2)
    const maxH = Math.min(h * 0.16, 150)
    const grad = ctx.createLinearGradient(0, h * dpr, 0, (h - maxH) * dpr)
    grad.addColorStop(0, 'rgba(167, 123, 255, 0.55)')
    grad.addColorStop(0.6, 'rgba(255, 79, 210, 0.45)')
    grad.addColorStop(1, 'rgba(79, 227, 255, 0.35)')
    ctx.fillStyle = grad
    ctx.globalAlpha = 0.55 * fade
    for (let i = 0; i < n; i++) {
      const bh = Math.max(2, spectrum[i] * maxH)
      const y = (h - bh) * dpr
      const gap = Math.max(1, barW * 0.28)
      // mirrored from the centre outwards: bass in the middle
      const xr = (w / 2 + i * barW) * dpr
      const xl = (w / 2 - (i + 1) * barW) * dpr
      ctx.fillRect(xr + gap * dpr * 0.5, y, (barW - gap) * dpr, bh * dpr)
      ctx.fillRect(xl + gap * dpr * 0.5, y, (barW - gap) * dpr, bh * dpr)
    }
    ctx.globalAlpha = 1
  }
}

// ------------------------------------------------------------------ helpers

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]
const clampN = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const edge = (t: number, fadeIn: number, fadeOut: number) =>
  t < fadeIn ? t / fadeIn : t > 1 - fadeOut ? (1 - t) / fadeOut : 1
const easeOutBack = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D | null] {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function makeSparkle(color: string): Sprite {
  const size = 64
  const [c, g] = makeCanvas(size, size)
  if (!g) return c
  const m = size / 2
  const halo = g.createRadialGradient(m, m, 0, m, m, m)
  halo.addColorStop(0, hexA(color, 0.55))
  halo.addColorStop(0.35, hexA(color, 0.18))
  halo.addColorStop(1, hexA(color, 0))
  g.fillStyle = halo
  g.fillRect(0, 0, size, size)
  // four-point star
  g.fillStyle = '#ffffff'
  g.beginPath()
  const r = size * 0.36
  const k = size * 0.06
  g.moveTo(m, m - r)
  g.quadraticCurveTo(m + k, m - k, m + r, m)
  g.quadraticCurveTo(m + k, m + k, m, m + r)
  g.quadraticCurveTo(m - k, m + k, m - r, m)
  g.quadraticCurveTo(m - k, m - k, m, m - r)
  g.fill()
  g.globalCompositeOperation = 'source-atop'
  g.fillStyle = hexA(color, 0.45)
  g.fillRect(0, 0, size, size)
  return c
}

function makePaw(color: string): Sprite {
  const size = 128
  const [c, g] = makeCanvas(size, size)
  if (!g) return c
  g.shadowColor = color
  g.shadowBlur = 16
  g.fillStyle = hexA(color, 0.95)
  g.beginPath()
  g.ellipse(64, 78, 24, 20, 0, 0, Math.PI * 2)
  g.fill()
  for (const [x, y, r] of [
    [36, 50, 9.5],
    [52, 37, 10],
    [76, 37, 10],
    [92, 50, 9.5],
  ] as const) {
    g.beginPath()
    g.ellipse(x, y, r * 0.85, r, 0, 0, Math.PI * 2)
    g.fill()
  }
  return c
}

function makeFish(color: string): Sprite {
  const size = 128
  const [c, g] = makeCanvas(size, size)
  if (!g) return c
  g.shadowColor = color
  g.shadowBlur = 14
  g.fillStyle = hexA(color, 0.95)
  g.beginPath()
  g.ellipse(58, 64, 30, 18, 0, 0, Math.PI * 2)
  g.fill()
  g.beginPath()
  g.moveTo(84, 64)
  g.lineTo(106, 48)
  g.lineTo(104, 80)
  g.closePath()
  g.fill()
  g.shadowBlur = 0
  g.fillStyle = '#1a0830'
  g.beginPath()
  g.arc(44, 60, 4, 0, Math.PI * 2)
  g.fill()
  return c
}

function makeNote(color: string, glyph: string): Sprite {
  const size = 128
  const [c, g] = makeCanvas(size, size)
  if (!g) return c
  g.shadowColor = color
  g.shadowBlur = 14
  g.fillStyle = color
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = "700 76px 'Fredoka Variable', 'Segoe UI Symbol', 'Apple Symbols', sans-serif"
  g.fillText(glyph, 64, 68)
  return c
}

function makeWords(): Sprite[] {
  return WORDS.map((text, i) => {
    const fontSize = 128 // rendered at 2x, drawn at ~0.5x
    const font = `700 ${fontSize}px 'Fredoka Variable', 'Fredoka', 'Arial Rounded MT Bold', system-ui, sans-serif`
    const [, pg] = makeCanvas(4, 4)
    if (pg) pg.font = font
    const width = Math.ceil((pg?.measureText(text).width ?? fontSize * text.length * 0.6) + 80)
    const height = Math.ceil(fontSize * 1.5)
    const [c, g] = makeCanvas(width, height)
    if (!g) return c
    g.font = font
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    const grad = g.createLinearGradient(0, 0, width, 0)
    const pair = i % 2 === 0 ? [PINK, CYAN] : [BUTTER, PINK]
    grad.addColorStop(0, pair[0])
    grad.addColorStop(1, pair[1])
    g.shadowColor = i % 2 === 0 ? PINK : VIOLET
    g.shadowBlur = 28
    g.lineWidth = 10
    g.strokeStyle = 'rgba(26, 8, 48, 0.9)'
    g.strokeText(text, width / 2, height / 2)
    g.shadowBlur = 0
    g.fillStyle = grad
    g.fillText(text, width / 2, height / 2)
    return c
  })
}

function hexA(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}
