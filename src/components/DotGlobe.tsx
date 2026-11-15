import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface Point {
  x: number
  y: number
  z: number
}

function fibonacciSphere(count: number): Point[] {
  const points: Point[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    points.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r })
  }
  return points
}

/**
 * A slowly turning sphere of dots with two orbital rings, drawn on one 2D
 * canvas. It only animates while on screen and the tab is visible, and draws
 * a single still frame for reduced-motion visitors.
 */
export function DotGlobe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const small = window.matchMedia('(max-width: 720px)').matches
    const points = fibonacciSphere(small ? 520 : 980)
    const tilt = 0.42
    const cosT = Math.cos(tilt)
    const sinT = Math.sin(tilt)

    let width = 0
    let height = 0
    let dpr = 1
    let angle = 0.6
    let frame = 0
    let last = 0
    let visible = true

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const cx = width / 2
      const cy = height / 2
      const radius = Math.min(width, height) * 0.36
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)

      // Back rings first, then dots, so the rings read as passing behind.
      const drawRing = (rx: number, ry: number, rot: number, alpha: number, satellite: number | null) => {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(rot)
        ctx.strokeStyle = `rgba(186, 161, 124, ${alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
        ctx.stroke()
        if (satellite !== null) {
          const sx = Math.cos(satellite) * rx
          const sy = Math.sin(satellite) * ry
          ctx.fillStyle = 'rgba(244, 241, 233, 0.95)'
          ctx.beginPath()
          ctx.arc(sx, sy, 2.4, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = 'rgba(186, 161, 124, 0.25)'
          ctx.beginPath()
          ctx.arc(sx, sy, 7, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      drawRing(radius * 1.55, radius * 0.38, -0.32, 0.32, angle * 2.2)
      drawRing(radius * 1.28, radius * 1.28 * 0.92, 0.5, 0.1, null)

      for (const p of points) {
        // Rotate around Y, then tilt around X.
        const x1 = p.x * cosA + p.z * sinA
        const z1 = -p.x * sinA + p.z * cosA
        const y2 = p.y * cosT - z1 * sinT
        const z2 = p.y * sinT + z1 * cosT
        const depth = (z2 + 1) / 2 // 0 back, 1 front
        const alpha = 0.05 + depth * depth * 0.62
        const size = 0.55 + depth * 1.15
        ctx.fillStyle = `rgba(244, 241, 233, ${alpha})`
        ctx.fillRect(cx + x1 * radius - size / 2, cy + y2 * radius - size / 2, size, size)
      }
    }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      const dt = last ? Math.min(64, now - last) : 16
      last = now
      angle += dt * 0.00011
      draw()
    }

    const start = () => {
      if (reduced || frame || !visible || document.hidden) return
      last = 0
      frame = requestAnimationFrame(tick)
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    io.observe(canvas)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    resize()
    start()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
