import { ExecutiveToggle } from '../components/ExecutiveToggle'
import { ArrowUpIcon } from '../components/primitives'
import { FOOTER, NAV } from '../content/site'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer" aria-labelledby="footer-title">
      <div className="container">
        <div className="grid footer__top">
          <p className="footer__tagline display" data-reveal>
            Independent by nature. <em>Exceptional by design.</em>
          </p>

          <nav className="footer__nav" aria-label="Footer">
            <h2 className="mono muted">Index</h2>
            <ul>
              {NAV.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>
                    <span className="mono">{item.index}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__colophon">
            <h2 className="mono muted">Colophon</h2>
            <p>Set in Instrument Serif, Inter Tight and JetBrains Mono. Built with a great deal of patience.</p>
            <ExecutiveToggle />
          </div>
        </div>

        <h2 id="footer-title" className="footer__wordmark" aria-label="Jeff.">
          <span aria-hidden="true" data-reveal="lines" className="footer__wordmark-inner">
            <span className="line-mask">
              <span>
                JEFF<span className="footer__dot">.</span>
              </span>
            </span>
          </span>
        </h2>

        <div className="footer__bottom">
          <p className="footer__disclaimer">
            <strong>Parody notice.</strong> {FOOTER.disclaimer}
          </p>
          <p className="mono muted footer__copyright">© MMXXVI Jeff. All rights reserved, mostly by Jeff.</p>
          <a className="link footer__top-link" href="#top">
            <span className="link__text">Back to top</span>
            <span className="icon-ring">
              <ArrowUpIcon size={12} />
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}
