import type { CSSProperties } from 'react'
import { RunningHead, SplitLines } from '../components/primitives'
import { AWARDS } from '../content/site'
import './Awards.css'

export function Awards() {
  return (
    <section id="recognition" className="section section--light awards" aria-labelledby="awards-title">
      <div className="container">
        <RunningHead index="—" title="Recognition" aside="Distinctions & honours" />

        <div className="grid awards__intro">
          <SplitLines id="awards-title" className="h2 awards__title" lines={['Recognition', <em key="b">Without Borders.</em>]} />
          <p className="awards__note" data-reveal style={{ '--delay': '0.15s' } as CSSProperties}>
            Honours conferred by programmes that are, without exception, entirely fictional. Jeff accepted each of them in
            person, and slept through two.
          </p>
        </div>

        <ol className="awards__list">
          {AWARDS.map((a, i) => (
            <li key={a.title} className="award" data-reveal style={{ '--delay': `${i * 0.06}s` } as CSSProperties}>
              <span className="award__year display">{a.year}</span>
              <span className="award__title">{a.title}</span>
              <span className="award__by">{a.by}</span>
              <span className="award__index mono" aria-hidden="true">
                {String(AWARDS.length - i).padStart(2, '0')}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
