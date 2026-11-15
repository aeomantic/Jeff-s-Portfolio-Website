import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { NAV } from '../content/site'
import { useActiveSection } from '../hooks/useActiveSection'
import { useExecutive } from '../motion/executive'
import { ExecutiveToggle } from './ExecutiveToggle'
import './Header.css'

const SECTION_IDS = ['top', ...NAV.map((n) => n.id), 'space', 'recognition']

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const active = useActiveSection(SECTION_IDS)
  const { off } = useExecutive()
  const progressRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // One passive scroll listener drives both the header state and the progress rule.
  useEffect(() => {
    let frame = 0
    let wasScrolled = false
    const update = () => {
      frame = 0
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      progressRef.current?.style.setProperty('--progress', String(max > 0 ? Math.min(1, y / max) : 0))
      const isScrolled = y > 24
      if (isScrolled !== wasScrolled) {
        wasScrolled = isScrolled
        setScrolled(isScrolled)
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  const close = useCallback((restoreFocus = true) => {
    setOpen(false)
    if (restoreFocus) toggleRef.current?.focus()
  }, [])

  // Lock scroll while the menu is open; close it if the viewport grows to desktop.
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    root.style.overflow = 'hidden'
    const first = menuRef.current?.querySelector<HTMLElement>('a, button')
    first?.focus()
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = () => mql.matches && setOpen(false)
    mql.addEventListener('change', onChange)
    return () => {
      root.style.overflow = ''
      mql.removeEventListener('change', onChange)
    }
  }, [open])

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key !== 'Tab' || !menuRef.current) return
    // Keep focus inside the menu and its toggle.
    const focusables = [
      toggleRef.current,
      ...menuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    ].filter((el): el is HTMLElement => el !== null)
    const firstEl = focusables[0]
    const lastEl = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === firstEl) {
      event.preventDefault()
      lastEl.focus()
    } else if (!event.shiftKey && document.activeElement === lastEl) {
      event.preventDefault()
      firstEl.focus()
    }
  }

  return (
    <header className="site-header" data-scrolled={scrolled || open ? '' : undefined} data-open={open ? '' : undefined}>
      <div className="site-header__bar container" onKeyDown={open ? onMenuKeyDown : undefined}>
        <a href="#top" className="wordmark" aria-label="Jeff, back to top" onClick={() => open && close(false)}>
          JEFF<span className="wordmark__dot">.</span>
        </a>

        <nav className="site-nav" aria-label="Primary">
          <ol>
            {NAV.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} aria-current={active === item.id ? 'true' : undefined}>
                  <span className="site-nav__index">{item.index}</span>
                  <span className="site-nav__label">{item.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <p className="site-header__status mono">
          <span className="dot dot--live" aria-hidden="true" />
          <span>{off ? 'Currently spinning' : 'Accepting select engagements'}</span>
        </p>

        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle mono"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="menu-toggle__label">{open ? 'Close' : 'Menu'}</span>
          <span className="menu-toggle__icon" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        className="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        onKeyDown={onMenuKeyDown}
      >
        <nav aria-label="Mobile" className="mobile-menu__nav container">
          <ol>
            {NAV.map((item, i) => (
              <li key={item.id} style={{ '--i': i } as CSSProperties}>
                <a href={`#${item.id}`} onClick={() => close(false)}>
                  <span className="mono">{item.index}</span>
                  <span className="mobile-menu__label">{item.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="mobile-menu__foot container">
          <p className="mono muted">
            <span className="dot dot--live" aria-hidden="true" /> Accepting select engagements
          </p>
          <ExecutiveToggle />
        </div>
      </div>

      <div ref={progressRef} className="scroll-progress" aria-hidden="true" />
    </header>
  )
}
