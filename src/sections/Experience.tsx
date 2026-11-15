import { useState, type CSSProperties } from 'react'
import { PlusIcon, RunningHead, SplitLines } from '../components/primitives'
import { EXPERIENCE } from '../content/site'
import './Experience.css'

export function Experience() {
  const [open, setOpen] = useState<number | null>(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const active = hovered ?? open ?? 0
  const role = EXPERIENCE[active]

  return (
    <section id="experience" className="section experience" aria-labelledby="experience-title">
      <div className="container">
        <RunningHead index="02" title="Experience" aside="Selected appointments, 2010 — present" />

        <div className="grid">
          <div className="experience__aside">
            <SplitLines id="experience-title" className="h2" lines={['A Career', 'Beyond', <em key="c">Convention.</em>]} />

            <div className="experience__ticker" aria-hidden="true">
              <span className="experience__ticker-index mono">
                {String(active + 1).padStart(2, '0')} / {String(EXPERIENCE.length).padStart(2, '0')}
              </span>
              <span key={active} className="experience__ticker-year display">
                {role.start}
              </span>
              <span className="experience__ticker-org mono">{role.org}</span>
            </div>
          </div>

          <ol className="experience__list" onMouseLeave={() => setHovered(null)}>
            {EXPERIENCE.map((item, i) => {
              const isOpen = open === i
              const id = `role-${i}`
              return (
                <li
                  key={item.title}
                  className="exp-row"
                  data-open={isOpen ? '' : undefined}
                  data-reveal
                  style={{ '--delay': `${i * 0.06}s` } as CSSProperties}
                >
                  <h3 className="exp-row__heading">
                    <button
                      type="button"
                      className="exp-row__btn"
                      id={`${id}-btn`}
                      aria-expanded={isOpen}
                      aria-controls={`${id}-panel`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      onMouseEnter={() => setHovered(i)}
                      onFocus={() => setHovered(i)}
                      onBlur={() => setHovered(null)}
                    >
                      <span className="exp-row__index mono">{String(i + 1).padStart(2, '0')}</span>
                      <span className="exp-row__main">
                        <span className="exp-row__title">{item.title}</span>
                        <span className="exp-row__org">{item.org}</span>
                      </span>
                      <span className="exp-row__years mono">
                        {item.start} — {item.end}
                      </span>
                      <span className="exp-row__icon" aria-hidden="true">
                        <PlusIcon />
                      </span>
                    </button>
                  </h3>
                  <div
                    className="exp-row__panel"
                    id={`${id}-panel`}
                    role="region"
                    aria-labelledby={`${id}-btn`}
                    inert={!isOpen}
                  >
                    <div className="exp-row__panel-inner">
                      <p className="exp-row__summary">{item.summary}</p>
                      <div className="exp-row__details">
                        <ul className="exp-row__tags" aria-label="Focus areas">
                          {item.focus.map((f) => (
                            <li key={f} className="mono">
                              {f}
                            </li>
                          ))}
                        </ul>
                        <p className="exp-row__aside">
                          <span className="mono">Of note</span>
                          {item.aside}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <p className="experience__disclaimer mono muted">All organisations and appointments are fictional.</p>
      </div>
    </section>
  )
}
