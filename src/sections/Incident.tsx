import type { CSSProperties } from 'react'
import { ExecutiveToggle } from '../components/ExecutiveToggle'
import { RunningHead, SplitLines } from '../components/primitives'
import { VideoPlayer } from '../components/VideoPlayer'
import { ASSETS, INCIDENT } from '../content/site'
import './Incident.css'

export function Incident() {
  return (
    <section id="incident" className="section section--night incident" aria-labelledby="incident-title">
      <div className="container">
        <RunningHead index="05" title="The Incident" aside={`File No. ${INCIDENT.file}`} />

        <div className="grid incident__intro">
          <SplitLines
            id="incident-title"
            className="h2 incident__title"
            lines={['Even Great Minds', <span key="n">Need a <em>Moment.</em></span>]}
          />
          <p className="incident__sub display" data-reveal style={{ '--delay': '0.2s' } as CSSProperties}>
            An Unscheduled Demonstration of Rotational Excellence.
          </p>
        </div>

        <dl className="incident__meta" data-reveal style={{ '--delay': '0.1s' } as CSSProperties}>
          {INCIDENT.meta.map((m) => (
            <div key={m.label}>
              <dt className="mono muted">{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>

        <div className="incident__stage" data-reveal="stage">
          <VideoPlayer
            src={ASSETS.incidentVideo}
            poster={ASSETS.incidentPoster}
            title="The Incident: Jeff spinning to a psytrance remix"
          />
        </div>

        <div className="incident__caption">
          <p className="mono muted">
            <span className="incident__fig">Fig. 05</span> {INCIDENT.caption}
          </p>
          <ExecutiveToggle />
        </div>
      </div>
    </section>
  )
}
