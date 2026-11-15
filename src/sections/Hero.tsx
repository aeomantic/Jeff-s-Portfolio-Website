import { useEffect, useRef, type CSSProperties } from 'react'
import { ArrowDownIcon, ArrowIcon, PlayIcon, SplitLines } from '../components/primitives'
import { DotGlobe } from '../components/DotGlobe'
import { ASSETS, HERO } from '../content/site'
import { useExecutive } from '../motion/executive'
import './Hero.css'

const BADGE_TEXT = 'Executive · Scientist · Visionary · Astronaut · Cat · '

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const { off } = useExecutive()

  // Gentle pointer parallax on fine pointers only.
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const mql = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    if (!mql.matches) return

    let frame = 0
    let tx = 0
    let ty = 0
    let x = 0
    let y = 0
    const step = () => {
      x += (tx - x) * 0.08
      y += (ty - y) * 0.08
      hero.style.setProperty('--px', x.toFixed(4))
      hero.style.setProperty('--py', y.toFixed(4))
      frame = Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001 ? requestAnimationFrame(step) : 0
    }
    const onMove = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect()
      tx = ((event.clientX - rect.left) / rect.width) * 2 - 1
      ty = ((event.clientY - rect.top) / rect.height) * 2 - 1
      if (!frame) frame = requestAnimationFrame(step)
    }
    const onLeave = () => {
      tx = 0
      ty = 0
      if (!frame) frame = requestAnimationFrame(step)
    }
    hero.addEventListener('pointermove', onMove)
    hero.addEventListener('pointerleave', onLeave)
    return () => {
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section id="top" ref={heroRef} className="hero" aria-labelledby="hero-title">
      <div className="hero__guides" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="grain" aria-hidden="true" />

      <div className="hero__inner container grid">
        <div className="hero__intro">
          <p className="hero__eyebrow mono" data-reveal style={{ '--delay': '0.15s' } as CSSProperties}>
            <span className="hero__eyebrow-rule" aria-hidden="true" />
            {HERO.eyebrow}
          </p>

          <SplitLines
            as="h1"
            id="hero-title"
            className="hero__title display"
            delay={0.25}
            lines={[
              HERO.lines[0],
              HERO.lines[1],
              <em key="accent" className="hero__accent">
                {off ? HERO.accentOff : HERO.accent}
              </em>,
            ]}
          />
        </div>

        <div className="hero__visual">
          <DotGlobe className="hero__globe" />

          <figure className="hero__figure">
            <div className="hero__plate">
              <div className="hero__frame" data-reveal="image" style={{ '--delay': '0.45s' } as CSSProperties}>
                <img
                  className="hero__portrait"
                  src={ASSETS.portraitWebp}
                  width={640}
                  height={640}
                  alt="Official portrait of Jeff: a cat in a charcoal suit, white shirt and red tie, holding a briefcase."
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="grain" aria-hidden="true" />
                <span className="hero__frame-label mono" aria-hidden="true">
                  Fig. 01
                </span>
              </div>
              <span className="hero__corner hero__corner--tl" aria-hidden="true" />
              <span className="hero__corner hero__corner--tr" aria-hidden="true" />
              <span className="hero__corner hero__corner--bl" aria-hidden="true" />
              <span className="hero__corner hero__corner--br" aria-hidden="true" />
              <a href="#about" className="hero__badge" aria-label="Scroll to About Jeff">
                <svg viewBox="0 0 200 200" className="hero__badge-ring" aria-hidden="true">
                  <defs>
                    <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                  </defs>
                  <text>
                    <textPath href="#badge-circle" textLength="488">
                      {BADGE_TEXT}
                    </textPath>
                  </text>
                </svg>
                <span className="hero__badge-core">
                  <ArrowDownIcon size={16} />
                </span>
              </a>
            </div>
            <figcaption className="hero__caption mono" data-reveal="fade" style={{ '--delay': '1.1s' } as CSSProperties}>
              <span>Jeff, Chief Executive Officer</span>
              <span className="muted">Official portrait</span>
            </figcaption>
          </figure>
        </div>

        <div className="hero__support">
          <p className="hero__body" data-reveal style={{ '--delay': '0.75s' } as CSSProperties}>
            {HERO.body}
          </p>

          <div className="hero__actions" data-reveal style={{ '--delay': '0.9s' } as CSSProperties}>
            <a className="btn" href="#about">
              <span>Explore the Portfolio</span>
              <span className="btn__icon">
                <ArrowIcon />
              </span>
            </a>
            <a className="link" href="#incident">
              <span className="icon-ring">
                <PlayIcon size={12} />
              </span>
              <span className="link__text">View the Incident</span>
            </a>
          </div>

          <p className="hero__signature" data-reveal style={{ '--delay': '1.05s' } as CSSProperties}>
            <span className="hero__signature-name">— {HERO.signature}</span>
            <span className="mono muted">{HERO.signatureRole}</span>
          </p>
        </div>

        <dl className="hero__meta" data-reveal="fade" style={{ '--delay': '1.2s' } as CSSProperties}>
          {HERO.meta.map((item) => (
            <div key={item.label}>
              <dt className="mono muted">{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
          <div>
            <dt className="mono muted">Edition</dt>
            <dd>Vol. I, MMXXVI</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
