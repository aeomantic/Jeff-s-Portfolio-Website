import type { CSSProperties } from 'react'
import { CountUp } from '../components/CountUp'
import { RunningHead, SplitLines } from '../components/primitives'
import { MISSION } from '../content/site'
import { useReducedMotion } from '../hooks/useReducedMotion'
import './Space.css'

const ORBIT = 'M -120 470 Q 800 -70 1720 470'

export function Space() {
  const reduced = useReducedMotion()
  return (
    <section id="space" className="section section--night space" aria-labelledby="space-title">
      <div className="space__stars space__stars--far" aria-hidden="true" />
      <div className="space__stars space__stars--near" aria-hidden="true" />

      <div className="container space__content">
        <RunningHead index="—" title="Expedition" aside="Mission archive · Fictional record" />

        <div className="grid space__intro">
          <div className="space__heading">
            <SplitLines id="space-title" className="h2" lines={['Beyond the', <em key="a">Atmosphere.</em>]} />
            <p className="space__copy" data-reveal style={{ '--delay': '0.15s' } as CSSProperties}>
              Following years of research, Jeff participated in a landmark orbital research expedition, expanding his
              perspective on science, civilisation, and the remarkable absence of gravity.
            </p>
          </div>

          <dl className="space__facts" data-reveal style={{ '--delay': '0.25s' } as CSSProperties}>
            <div className="space__designation">
              <dt className="mono">Mission</dt>
              <dd className="display">{MISSION.designation}</dd>
            </div>
            {MISSION.facts.map((f) => (
              <div key={f.label}>
                <dt className="mono">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="space__stage">
        <svg className="space__earth" viewBox="0 0 1600 640" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <defs>
            <radialGradient id="earth-fill" cx="50%" cy="0%" r="70%">
              <stop offset="0%" stopColor="#14233a" />
              <stop offset="45%" stopColor="#0a1220" />
              <stop offset="100%" stopColor="#05070b" />
            </radialGradient>
            <linearGradient id="rim" x1="0" x2="1">
              <stop offset="0%" stopColor="#7fb4ff" stopOpacity="0" />
              <stop offset="50%" stopColor="#a9ccff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#7fb4ff" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-10%" y="-50%" width="120%" height="200%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
            <clipPath id="earth-clip">
              <circle cx="800" cy="1900" r="1560" />
            </clipPath>
          </defs>

          <circle cx="800" cy="1900" r="1560" fill="none" stroke="url(#rim)" strokeWidth="26" filter="url(#glow)" opacity="0.55" />
          <circle cx="800" cy="1900" r="1560" fill="url(#earth-fill)" />
          <g clipPath="url(#earth-clip)" className="space__grid">
            {[1400, 1460, 1520].map((r) => (
              <circle key={r} cx="800" cy="1900" r={r} fill="none" />
            ))}
            {[-0.5, -0.3, -0.12, 0.12, 0.3, 0.5].map((k) => (
              <ellipse key={k} cx="800" cy="1900" rx={Math.abs(k) * 2600} ry="1560" fill="none" />
            ))}
          </g>
          <circle cx="800" cy="1900" r="1560" fill="none" stroke="url(#rim)" strokeWidth="1.5" />

          <path d={ORBIT} className="space__orbit" />
          <g className="space__station">
            <circle r="14" fill="rgba(186,161,124,0.18)" />
            <circle r="4" fill="#f4f1e9" />
            {reduced ? null : <animateMotion dur="22s" repeatCount="indefinite" path={ORBIT} />}
          </g>
        </svg>

        <div className="container space__altitude">
          <p className="space__altitude-figure" data-reveal>
            <span className="space__altitude-number display">
              <CountUp value={MISSION.altitude} duration={2200} />
            </span>
            <span className="space__altitude-unit mono">KM</span>
          </p>
          <p className="space__altitude-caption" data-reveal style={{ '--delay': '0.2s' } as CSSProperties}>
            <span className="display">Above the ordinary.</span>
            <span className="mono">Mean orbital altitude</span>
          </p>
          <p className="space__statement display" data-reveal style={{ '--delay': '0.3s' } as CSSProperties}>
            Earth was never <em>the limit.</em>
          </p>
        </div>
      </div>

      <div className="container space__timeline-wrap">
        <h3 className="mono space__timeline-title" data-reveal>
          Mission log
        </h3>
        <div className="space__timeline-box">
          <span className="space__timeline-track" data-reveal="rule" aria-hidden="true" />
          <ol className="space__timeline">
          {MISSION.timeline.map((m, i) => (
            <li key={m.mark} data-reveal style={{ '--delay': `${0.15 + i * 0.12}s` } as CSSProperties}>
              <span className="space__node" aria-hidden="true" />
              <span className="mono space__mark">{m.mark}</span>
              <span className="space__event">{m.title}</span>
              <span className="space__note">{m.note}</span>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
