import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { RunningHead, SplitLines } from '../components/primitives'
import { MAP_HEIGHT, MAP_WIDTH, project, worldDotsPath } from '../components/worldDots'
import { EDUCATION } from '../content/site'
import './Education.css'

const POINTS = EDUCATION.map((d) => project(d.lon, d.lat))

function arcPath(from: [number, number], to: [number, number]): string {
  const [x1, y1] = from
  const [x2, y2] = to
  const dist = Math.hypot(x2 - x1, y2 - y1)
  const cx = (x1 + x2) / 2
  const cy = Math.min(y1, y2) - Math.max(36, dist * 0.32)
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

export function Education() {
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const dots = useMemo(() => worldDotsPath(), [])
  const phd = EDUCATION[active]

  const select = (i: number, focus = false) => {
    setActive(i)
    if (focus) tabRefs.current[i]?.focus()
  }

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = EDUCATION.length - 1
    const keys: Record<string, number> = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowDown: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      ArrowUp: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    }
    if (event.key in keys) {
      event.preventDefault()
      select(keys[event.key], true)
    }
  }

  return (
    <section id="education" className="section section--light education" aria-labelledby="education-title">
      <div className="container">
        <RunningHead index="03" title="Education" aside="Five doctorates, conferred 2004 — 2015" />

        <div className="grid education__intro">
          <SplitLines
            id="education-title"
            className="h2 education__title"
            lines={['The Pursuit', <em key="k">of Knowledge.</em>]}
          />
          <p className="education__sub lead" data-reveal style={{ '--delay': '0.2s' } as CSSProperties}>
            Five doctorates. Four nations. A&nbsp;lifetime of questions.
          </p>
        </div>

        <div className="education__stage grid">
          <div className="education__map" data-reveal="map">
            <svg
              className="education__map-svg"
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <path className="education__dots" d={dots} />
              {POINTS.slice(0, -1).map((from, i) => {
                const d = arcPath(from, POINTS[i + 1])
                return (
                  <g key={i}>
                    <path className="education__arc" d={d} />
                    <path
                      className="education__arc education__arc--travelled"
                      data-travelled={i < active ? '' : undefined}
                      d={d}
                      pathLength={1}
                    />
                  </g>
                )
              })}
            </svg>

            {EDUCATION.map((d, i) => {
              const [x, y] = POINTS[i]
              return (
                <div
                  key={d.numeral}
                  className="education__marker"
                  data-active={i === active ? '' : undefined}
                  data-visited={i < active ? '' : undefined}
                  data-side={d.code === 'SG' || d.code === 'UK' ? 'left' : 'right'}
                  style={{ left: `${(x / MAP_WIDTH) * 100}%`, top: `${(y / MAP_HEIGHT) * 100}%` } as CSSProperties}
                  onClick={() => select(i)}
                  aria-hidden="true"
                >
                  <span className="education__marker-dot" />
                  <span className="education__marker-label mono">
                    {d.numeral} · {d.code}
                  </span>
                </div>
              )
            })}

            <p className="education__legend mono muted" aria-hidden="true">
              <span>Fig. 03 — Academic itinerary</span>
              <span>Equirectangular, not to scale</span>
            </p>
          </div>

          <div className="education__tabs" role="tablist" aria-label="Doctorates" aria-orientation="horizontal">
            {EDUCATION.map((d, i) => (
              <button
                key={d.numeral}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`phd-tab-${i}`}
                aria-selected={i === active}
                aria-controls="phd-panel"
                tabIndex={i === active ? 0 : -1}
                className="education__tab"
                onClick={() => select(i)}
                onKeyDown={onTabKeyDown}
              >
                <span className="education__tab-numeral">{d.numeral}</span>
                <span className="education__tab-discipline">{d.discipline}</span>
                <span className="education__tab-country mono">
                  <span className="education__tab-country-full">{d.country}</span>
                  <span className="education__tab-country-code" aria-hidden="true">
                    {d.code}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <article
            id="phd-panel"
            className="education__panel"
            role="tabpanel"
            aria-labelledby={`phd-tab-${active}`}
            tabIndex={0}
          >
            <div key={active} className="education__panel-inner">
              <div className="education__panel-head">
                <span className="education__panel-numeral display" aria-hidden="true">
                  {phd.numeral}
                </span>
                <span className="mono muted">Doctor of Philosophy</span>
              </div>
              <h3 className="education__discipline display">{phd.discipline}</h3>

              <dl className="education__facts">
                <div>
                  <dt className="mono muted">Nation</dt>
                  <dd>{phd.country}</dd>
                </div>
                <div>
                  <dt className="mono muted">Conferred</dt>
                  <dd>{phd.year}</dd>
                </div>
                <div>
                  <dt className="mono muted">Coordinates</dt>
                  <dd className="tnum">{phd.coords}</dd>
                </div>
              </dl>

              <div className="education__block">
                <h4 className="mono muted">Dissertation</h4>
                <p className="education__dissertation">“{phd.dissertation}”</p>
              </div>
              <div className="education__block">
                <h4 className="mono muted">Research focus</h4>
                <p>{phd.focus}</p>
              </div>
              <div className="education__block education__block--remark">
                <h4 className="mono muted">Examiners’ remark</h4>
                <p>{phd.remark}</p>
              </div>
            </div>
          </article>
        </div>

        <p className="education__disclaimer mono muted">
          Degrees are fictional and were not conferred by any real institution.
        </p>
      </div>
    </section>
  )
}
