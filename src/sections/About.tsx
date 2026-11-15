import type { CSSProperties } from 'react'
import { CountUp } from '../components/CountUp'
import { RunningHead, SplitLines } from '../components/primitives'
import { ABOUT, ASSETS } from '../content/site'
import './About.css'

export function About() {
  return (
    <section id="about" className="section section--light about" aria-labelledby="about-title">
      <div className="container">
        <RunningHead index="01" title="About Jeff" aside="A brief biography" />

        <div className="grid about__grid">
          <div className="about__heading">
            <SplitLines id="about-title" className="h2" lines={['An Unconventional', <em key="m">Mind.</em>]} />

            <figure className="about__id" data-reveal="image" style={{ '--delay': '0.2s' } as CSSProperties}>
              <img src={ASSETS.portraitWebp} width={640} height={640} alt="" loading="lazy" decoding="async" />
              <figcaption className="mono">
                <span>Subject</span>
                <span>Jeff</span>
              </figcaption>
            </figure>
          </div>

          <div className="about__body">
            <p className="lead about__lead" data-reveal>
              {ABOUT.lead}
            </p>

            <div className="about__columns">
              {ABOUT.body.map((paragraph, i) => (
                <p key={i} data-reveal style={{ '--delay': `${0.1 + i * 0.08}s` } as CSSProperties}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="about__fields">
              <h3 className="mono muted" data-reveal>
                Fields of contribution
              </h3>
              <ol>
                {ABOUT.fields.map((field, i) => (
                  <li key={field.name} data-reveal style={{ '--delay': `${i * 0.05}s` } as CSSProperties}>
                    <span className="mono about__field-index">{String(i + 1).padStart(2, '0')}</span>
                    <span className="about__field-name">{field.name}</span>
                    <span className="about__field-note muted">{field.note}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="about__stats">
          <span className="about__stats-rule" data-reveal="rule" aria-hidden="true" />
          <dl className="grid">
            {ABOUT.stats.map((stat, i) => (
              <div key={stat.label} className="about__stat" data-reveal style={{ '--delay': `${i * 0.08}s` } as CSSProperties}>
                <dt className="mono">{stat.label}</dt>
                <dd className="about__stat-value display">
                  <CountUp value={stat.value} pad={stat.pad} suffix={stat.suffix} />
                </dd>
                <dd className="about__stat-note muted">{stat.note}</dd>
              </div>
            ))}
          </dl>
          <p className="about__footnote mono muted">* {ABOUT.footnote}</p>
        </div>
      </div>
    </section>
  )
}
