import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { ASSETS } from '../config'
import './CoffeeScene.css'

interface CoffeeSceneProps {
  served: number
  reducedMotion: boolean
  onServe(): void
  onReplay(): void
}

interface Heart {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  rot: number
  size: number
  delay: number
  color: string
  shape: 'heart' | 'sparkle'
}

const CONFIRMATIONS = [
  'One coffee, coming right up! 💖',
  'Make that two! Extra ice, extra love. 💖',
  'A third one? Now you’ll be the one spinning. 🌀💖',
]

const HEART_COLORS = ['#f28ba3', '#e8657f', '#f7c1cc', '#d9a07b', '#ffb3c7']

let nextHeartId = 1

export function CoffeeScene({ served, reducedMotion, onServe, onReplay }: CoffeeSceneProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const [hearts, setHearts] = useState<Heart[]>([])
  const [photoFailed, setPhotoFailed] = useState(false)
  const timers = useRef<number[]>([])

  // Move focus to the invitation so keyboard and screen-reader users land here.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  const handleServe = (event: MouseEvent<HTMLButtonElement>) => {
    onServe()

    // A happy little hop from the coffee cat.
    if (!reducedMotion) {
      cardRef.current?.animate(
        [
          { transform: 'translateY(0) rotate(0deg) scale(1)' },
          { transform: 'translateY(-16px) rotate(-1.5deg) scale(1.03)', offset: 0.35 },
          { transform: 'translateY(0) rotate(0.8deg) scale(0.99)', offset: 0.7 },
          { transform: 'translateY(0) rotate(0deg) scale(1)' },
        ],
        { duration: 650, easing: 'cubic-bezier(.34,1.56,.64,1)' },
      )
    }

    // Heart + sparkle burst from the button.
    const rect = event.currentTarget.getBoundingClientRect()
    const originX = rect.left + rect.width / 2
    const originY = rect.top + rect.height / 2
    const count = reducedMotion ? 5 : 14
    const burst: Heart[] = Array.from({ length: count }, (_, i) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25
      const distance = reducedMotion ? 0 : 70 + Math.random() * 120
      return {
        id: nextHeartId++,
        x: originX + (reducedMotion ? (Math.random() - 0.5) * rect.width : 0),
        y: originY - (reducedMotion ? 30 + Math.random() * 30 : 0),
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - (reducedMotion ? 0 : 30),
        rot: (Math.random() - 0.5) * 70,
        size: 14 + Math.random() * 16,
        delay: Math.random() * 120,
        color: HEART_COLORS[i % HEART_COLORS.length],
        shape: i % 4 === 3 ? 'sparkle' : 'heart',
      }
    })
    setHearts((current) => [...current, ...burst])
    const ids = new Set(burst.map((h) => h.id))
    const timer = window.setTimeout(() => {
      setHearts((current) => current.filter((h) => !ids.has(h.id)))
    }, 1700)
    timers.current.push(timer)
  }

  const confirmation = served > 0 ? CONFIRMATIONS[Math.min(served, CONFIRMATIONS.length) - 1] : ''

  return (
    <main className={`coffee${reducedMotion ? ' coffee--calm' : ''}`} aria-labelledby="coffee-title">
      <div className="coffee__decor" aria-hidden="true">
        <span className="decor decor--bean" style={{ '--x': '8%', '--y': '14%', '--d': '0s' } as CSSProperties} />
        <span className="decor decor--heart" style={{ '--x': '88%', '--y': '12%', '--d': '-2s' } as CSSProperties} />
        <span className="decor decor--bean" style={{ '--x': '92%', '--y': '58%', '--d': '-4s' } as CSSProperties} />
        <span className="decor decor--heart" style={{ '--x': '5%', '--y': '70%', '--d': '-1s' } as CSSProperties} />
        <span className="decor decor--bean" style={{ '--x': '40%', '--y': '92%', '--d': '-3s' } as CSSProperties} />
        <span className="decor decor--heart" style={{ '--x': '62%', '--y': '5%', '--d': '-5s' } as CSSProperties} />
      </div>

      <div className="coffee__layout">
        <div className="coffee__photo-enter">
          <div className="coffee__photo-float">
            <figure className="coffee-card" ref={cardRef}>
              <span className="coffee-card__tape" aria-hidden="true" />
              {photoFailed ? (
                <div className="coffee-card__missing" role="img" aria-label="Coffee cat photo could not load">
                  <span aria-hidden="true">☕</span>
                </div>
              ) : (
                <img
                  className="coffee-card__photo"
                  src={ASSETS.coffeeCat}
                  alt="A fluffy cat in a business suit and red tie, holding a briefcase and offering an iced coffee"
                  width={419}
                  height={477}
                  draggable={false}
                  onError={() => setPhotoFailed(true)}
                />
              )}
              <span className="coffee-card__sparkle coffee-card__sparkle--a" aria-hidden="true" />
              <span className="coffee-card__sparkle coffee-card__sparkle--b" aria-hidden="true" />
              <span className="coffee-card__sparkle coffee-card__sparkle--c" aria-hidden="true" />
              <figcaption className="coffee-card__caption">Business Cat · Coffee Dept.</figcaption>
            </figure>
          </div>
        </div>

        <div className="coffee__copy">
          <h1 id="coffee-title" className="coffee__title rise" ref={headingRef} tabIndex={-1}>
            Coffee? <span aria-hidden="true">☕</span>
          </h1>
          <p className="coffee__lede rise" style={{ '--delay': '120ms' } as CSSProperties}>
            After all that spinning, you deserve a little break.
          </p>
          <div className="coffee__actions rise" style={{ '--delay': '240ms' } as CSSProperties}>
            <button type="button" className="btn btn--primary" onClick={handleServe}>
              Yes, please! <span aria-hidden="true">☕</span>
            </button>
            <button type="button" className="btn btn--soft" onClick={onReplay}>
              Replay the Rave <span aria-hidden="true">🌀</span>
            </button>
          </div>
          <p className="coffee__confirm" role="status" aria-live="polite">
            {confirmation && (
              <span key={served} className="coffee__confirm-text">
                {confirmation}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="hearts" aria-hidden="true">
        {hearts.map((h) => (
          <span
            key={h.id}
            className={`heart heart--${h.shape}`}
            style={
              {
                left: `${h.x}px`,
                top: `${h.y}px`,
                width: `${h.size}px`,
                height: `${h.size}px`,
                color: h.color,
                '--dx': `${h.dx}px`,
                '--dy': `${h.dy}px`,
                '--rot': `${h.rot}deg`,
                '--delay': `${h.delay}ms`,
              } as CSSProperties
            }
          >
            {h.shape === 'heart' ? <HeartShape /> : <SparkleShape />}
          </span>
        ))}
      </div>
    </main>
  )
}

function HeartShape() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path
        d="M12 21.2s-7.6-4.6-9.6-9.4C.9 8.2 3 4.5 6.6 4.5c2.2 0 3.6 1.2 4.4 2.5.8-1.3 2.2-2.5 4.4-2.5 3.6 0 5.7 3.7 4.2 7.3-2 4.8-7.6 9.4-7.6 9.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SparkleShape() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M12 3C12.6 8.4 15.6 11.4 21 12 15.6 12.6 12.6 15.6 12 21 11.4 15.6 8.4 12.6 3 12 8.4 11.4 11.4 8.4 12 3Z" fill="currentColor" />
    </svg>
  )
}
