import { useState, type CSSProperties } from 'react'
import { CoffeeDialog } from '../components/CoffeeDialog'
import { ArrowIcon, ArrowUpIcon, RunningHead, SplitLines } from '../components/primitives'
import { ASSETS, CONTACT } from '../content/site'
import './Contact.css'

const DETAILS = [
  { label: 'Office hours', value: '10:00 — 10:20, between naps' },
  { label: 'Preferred venue', value: 'Any sunny windowsill' },
  { label: 'Response time', value: 'Eventually' },
]

export function Contact() {
  const [coffeeOpen, setCoffeeOpen] = useState(false)

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container">
        <RunningHead index="06" title="Contact" aside="Correspondence & coffee" />

        <div className="grid contact__grid">
          <figure className="contact__figure">
            <div className="contact__frame" data-reveal="image">
              <img
                src={ASSETS.coffeeWebp}
                width={419}
                height={477}
                loading="lazy"
                decoding="async"
                alt="Jeff in a suit and red tie, holding a briefcase in one hand and offering an iced coffee with the other."
              />
            </div>
            <figcaption className="mono muted">
              <span>Fig. 06</span>
              <span>Coffee, offered</span>
            </figcaption>
          </figure>

          <div className="contact__body">
            <p className="mono contact__eyebrow" data-reveal>
              Great Conversations Start Here
            </p>
            <SplitLines
              id="contact-title"
              className="h2 contact__title"
              lines={['An Extraordinary Mind.', <em key="o">A Very Ordinary Coffee.</em>]}
            />
            <p className="contact__copy" data-reveal style={{ '--delay': '0.2s' } as CSSProperties}>
              Available for thoughtful conversations, ambitious collaborations, and the occasional afternoon coffee.
            </p>

            <div className="contact__actions" data-reveal style={{ '--delay': '0.3s' } as CSSProperties}>
              <button type="button" className="btn" onClick={() => setCoffeeOpen(true)} aria-haspopup="dialog">
                <span>Have a Coffee with Jeff</span>
                <span className="btn__icon">
                  <ArrowIcon />
                </span>
              </button>
              <a className="link" href="#top">
                <span className="icon-ring">
                  <ArrowUpIcon size={12} />
                </span>
                <span className="link__text">Return to the Top</span>
              </a>
            </div>

            <dl className="contact__details" data-reveal style={{ '--delay': '0.4s' } as CSSProperties}>
              {DETAILS.map((d) => (
                <div key={d.label}>
                  <dt className="mono muted">{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
              {CONTACT.email ? (
                <div>
                  <dt className="mono muted">Correspondence</dt>
                  <dd>
                    <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </div>

      <CoffeeDialog open={coffeeOpen} onClose={() => setCoffeeOpen(false)} />
    </section>
  )
}
