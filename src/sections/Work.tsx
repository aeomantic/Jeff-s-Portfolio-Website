import { useState, type CSSProperties } from 'react'
import { PlusIcon, RunningHead, SplitLines } from '../components/primitives'
import { ProjectVisual } from '../components/ProjectVisual'
import { PROJECTS } from '../content/site'
import './Work.css'

export function Work() {
  const [open, setOpen] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const active = hovered ?? open ?? 0
  const project = PROJECTS[active]

  return (
    <section id="work" className="section work" aria-labelledby="work-title">
      <div className="container">
        <RunningHead index="04" title="Selected work" aside="Research initiatives, 2003 — present" />

        <div className="grid work__intro">
          <SplitLines id="work-title" className="h2 work__title" lines={['A Body', <em key="w">of Work.</em>]} />
          <p className="work__lede" data-reveal style={{ '--delay': '0.15s' } as CSSProperties}>
            Five research initiatives spanning orbit, cognition, energy, medicine and metaphysics. Open any project to read
            its case file.
          </p>
        </div>

        <div className="grid work__body">
          <ol className="work__list" onMouseLeave={() => setHovered(null)}>
            {PROJECTS.map((p, i) => {
              const isOpen = open === i
              const id = `project-${i}`
              return (
                <li
                  key={p.name}
                  className="project"
                  data-open={isOpen ? '' : undefined}
                  data-active={active === i ? '' : undefined}
                  data-reveal
                  style={{ '--delay': `${i * 0.06}s` } as CSSProperties}
                >
                  <h3 className="project__heading">
                    <button
                      type="button"
                      className="project__btn"
                      id={`${id}-btn`}
                      aria-expanded={isOpen}
                      aria-controls={`${id}-panel`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      onMouseEnter={() => setHovered(i)}
                      onFocus={() => setHovered(i)}
                      onBlur={() => setHovered(null)}
                    >
                      <span className="project__index mono">P—{String(i + 1).padStart(2, '0')}</span>
                      <span className="project__name">
                        <span className="project__name-prefix mono">Project</span>
                        <span className="project__name-text">{p.name}</span>
                      </span>
                      <span className="project__icon" aria-hidden="true">
                        <PlusIcon />
                      </span>
                    </button>
                  </h3>
                  <p className="project__meta">
                    <span className="mono">{p.category}</span>
                    <span className="project__summary">{p.summary}</span>
                  </p>

                  <div
                    className="project__panel"
                    id={`${id}-panel`}
                    role="region"
                    aria-labelledby={`${id}-btn`}
                    inert={!isOpen}
                  >
                    <div className="project__panel-inner">
                      <div className="project__visual-inline">
                        <ProjectVisual kind={p.visual} />
                      </div>
                      <dl className="project__case">
                        <div>
                          <dt className="mono">Brief</dt>
                          <dd>{p.brief}</dd>
                        </div>
                        <div>
                          <dt className="mono">Approach</dt>
                          <dd>{p.approach}</dd>
                        </div>
                        <div>
                          <dt className="mono">Outcome</dt>
                          <dd>{p.outcome}</dd>
                        </div>
                      </dl>
                      <dl className="project__metrics">
                        <div>
                          <dt className="mono">Period</dt>
                          <dd>{p.years}</dd>
                        </div>
                        <div>
                          <dt className="mono">Status</dt>
                          <dd>{p.status}</dd>
                        </div>
                        {p.metrics.map((m) => (
                          <div key={m.label}>
                            <dt className="mono">{m.label}</dt>
                            <dd>{m.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>

          <aside className="work__plate" aria-hidden="true">
            <div className="work__plate-frame">
              <div className="work__plate-head mono">
                <span>Fig. P—{String(active + 1).padStart(2, '0')}</span>
                <span>{project.status}</span>
              </div>
              <div key={project.visual} className="work__plate-visual">
                <ProjectVisual kind={project.visual} />
              </div>
              <div className="work__plate-foot">
                <span className="work__plate-name display">{project.name}</span>
                <span className="mono">{project.years}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
