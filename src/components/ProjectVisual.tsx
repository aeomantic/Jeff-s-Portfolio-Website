import type { ProjectVisualKind } from '../content/site'
import { useReducedMotion } from '../hooks/useReducedMotion'
import './ProjectVisual.css'

interface Props {
  kind: ProjectVisualKind
}

/** Abstract, CSS/SVG-only diagrams for each research project. */
export function ProjectVisual({ kind }: Props) {
  const reduced = useReducedMotion()
  return (
    <svg className={`pv pv--${kind}`} viewBox="0 0 400 400" aria-hidden="true">
      {kind === 'orbital' && <Orbital animate={!reduced} />}
      {kind === 'sentience' && <Sentience animate={!reduced} />}
      {kind === 'prometheus' && <Prometheus />}
      {kind === 'equilibrium' && <Equilibrium />}
      {kind === 'existence' && <Existence />}
    </svg>
  )
}

function Orbital({ animate }: { animate: boolean }) {
  const orbits = [
    { rx: 170, ry: 58, rot: -18, dur: 14, r: 4 },
    { rx: 130, ry: 96, rot: 24, dur: 9, r: 3 },
    { rx: 92, ry: 34, rot: 62, dur: 6, r: 2.5 },
  ]
  return (
    <g>
      <circle cx="200" cy="200" r="150" className="pv-faint" strokeDasharray="1 6" />
      <circle cx="200" cy="200" r="34" className="pv-fill-gold" />
      <circle cx="200" cy="200" r="46" className="pv-line" opacity="0.4" />
      {orbits.map((o, i) => {
        const path = `M ${200 - o.rx} 200 a ${o.rx} ${o.ry} 0 1 0 ${o.rx * 2} 0 a ${o.rx} ${o.ry} 0 1 0 ${-o.rx * 2} 0`
        return (
          <g key={i} transform={`rotate(${o.rot} 200 200)`}>
            <path d={path} className="pv-line" />
            <circle r={o.r} className="pv-dot" cx={animate ? 0 : 200 - o.rx} cy={animate ? 0 : 200}>
              {animate && <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" path={path} />}
            </circle>
          </g>
        )
      })}
      <text x="20" y="384" className="pv-label">
        ALT. 408 KM / INCL. 51.6°
      </text>
    </g>
  )
}

const LAYERS = [
  [110, 170, 230, 290],
  [80, 130, 180, 230, 280, 330],
  [140, 200, 260],
]
const XS = [80, 200, 320]

function Sentience({ animate }: { animate: boolean }) {
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (let l = 0; l < LAYERS.length - 1; l++) {
    for (const y1 of LAYERS[l]) {
      for (const y2 of LAYERS[l + 1]) edges.push({ x1: XS[l], y1, x2: XS[l + 1], y2 })
    }
  }
  const pulses = [3, 11, 17, 26, 31, 38]
  return (
    <g>
      {edges.map((e, i) => (
        <line key={i} {...e} className="pv-faint" />
      ))}
      {animate &&
        pulses.map((edgeIndex, i) => {
          const e = edges[edgeIndex % edges.length]
          return (
            <circle key={i} r="3" className="pv-dot-gold">
              <animateMotion
                dur={`${1.8 + (i % 3) * 0.5}s`}
                begin={`${i * 0.35}s`}
                repeatCount="indefinite"
                path={`M${e.x1} ${e.y1}L${e.x2} ${e.y2}`}
              />
            </circle>
          )
        })}
      {LAYERS.map((ys, l) =>
        ys.map((y, i) => (
          <circle
            key={`${l}-${i}`}
            cx={XS[l]}
            cy={y}
            r={l === 2 ? 9 : 6}
            className={`pv-node ${l === 2 && i === 1 ? 'pv-node--decision' : ''}`}
            style={{ animationDelay: `${(l * 4 + i) * 0.21}s` }}
          />
        )),
      )}
      <text x="20" y="384" className="pv-label">
        DECISION: DECLINED (0.84)
      </text>
    </g>
  )
}

function Prometheus() {
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5)
  return (
    <g>
      <g className="pv-rotate-slow">
        {ticks.map((deg) => (
          <line
            key={deg}
            x1="200"
            y1={deg % 30 === 0 ? 28 : 36}
            x2="200"
            y2="44"
            className="pv-line"
            transform={`rotate(${deg} 200 200)`}
          />
        ))}
      </g>
      <circle cx="200" cy="200" r="132" className="pv-line" />
      <circle cx="200" cy="200" r="110" className="pv-faint pv-rotate-rev" strokeDasharray="4 8" />
      <circle cx="200" cy="200" r="84" className="pv-line" opacity="0.6" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect
          key={i}
          x="194"
          y="128"
          width="12"
          height="30"
          className="pv-rod"
          transform={`rotate(${i * 60} 200 200)`}
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
      <circle cx="200" cy="200" r="42" className="pv-core-glow" />
      <circle cx="200" cy="200" r="26" className="pv-fill-gold" />
      <text x="20" y="384" className="pv-label">
        CORE TEMP: COMFORTABLE
      </text>
    </g>
  )
}

function Equilibrium() {
  const stages = ['AWAKE', 'REM', 'N1', 'N2', 'N3']
  const levels = [0, 3, 4, 2, 3, 1, 4, 3, 2, 4, 3, 1, 3, 4, 2, 0]
  const stepW = 340 / levels.length
  let d = ''
  levels.forEach((lv, i) => {
    const x = 40 + i * stepW
    const y = 70 + lv * 34
    d += i === 0 ? `M${x} ${y}` : `H${x}V${y}`
  })
  d += `H${40 + levels.length * stepW}`
  let wave = 'M40 300'
  for (let x = 40; x <= 380; x += 4) wave += `L${x} ${300 + Math.sin(x / 9) * 14 * Math.sin(x / 60)}`
  return (
    <g>
      {stages.map((s, i) => (
        <g key={s}>
          <line x1="40" x2="380" y1={70 + i * 34} y2={70 + i * 34} className="pv-faint" strokeDasharray="1 5" />
          <text x="380" y={66 + i * 34} textAnchor="end" className="pv-label pv-label--sm">
            {s}
          </text>
        </g>
      ))}
      <path d={d} className="pv-line-gold pv-draw" pathLength={1} />
      <path d={wave} className="pv-line pv-wave" />
      <line x1="40" x2="40" y1="50" y2="330" className="pv-faint" />
      <text x="20" y="384" className="pv-label">
        RECOVERY CYCLE: 16 H / OPTIMAL
      </text>
    </g>
  )
}

function Existence() {
  return (
    <g>
      <line x1="40" y1="320" x2="360" y2="320" className="pv-line" />
      <polygon points="200,320 290,320 380,392 200,392" className="pv-light" />
      <rect x="130" y="80" width="140" height="240" className="pv-line" />
      <g className="pv-door">
        <polygon points="130,80 232,100 232,304 130,320" className="pv-door-panel" />
        <circle cx="218" cy="206" r="4" className="pv-dot-gold" />
      </g>
      <line x1="270" y1="80" x2="270" y2="320" className="pv-line-gold" opacity="0.8" />
      <text x="20" y="384" className="pv-label">
        STATUS: AJAR. PREFERENCE: UNKNOWN
      </text>
    </g>
  )
}
