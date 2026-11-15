import { useEffect, useRef, useState } from 'react'
import { ASSETS, COFFEE_ORDERS } from '../content/site'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { ArrowIcon } from './primitives'
import './CoffeeDialog.css'

type Order = (typeof COFFEE_ORDERS)[number]
type Step = 'choose' | 'brewing' | 'served'

const BREW_LINES = ['Consulting the board…', 'Reviewing your file…', 'Pouring with executive precision…']

interface Props {
  open: boolean
  onClose(): void
}

/** A small, entirely local coffee ritual in a native modal <dialog>. */
export function CoffeeDialog({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const reduced = useReducedMotion()
  const [step, setStep] = useState<Step>('choose')
  const [order, setOrder] = useState<Order | null>(null)
  const [line, setLine] = useState(0)
  const [served, setServed] = useState(0)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      document.documentElement.style.overflow = 'hidden'
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // Brewing: a short, skippable sequence. Reduced motion skips straight to served (see choose).
  useEffect(() => {
    if (step !== 'brewing') return
    const timers = [
      window.setTimeout(() => setLine(1), 800),
      window.setTimeout(() => setLine(2), 1600),
      window.setTimeout(() => setStep('served'), 2500),
    ]
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [step])

  // Keep keyboard and screen-reader focus with the content as each step replaces the last.
  useEffect(() => {
    if (!dialogRef.current?.open || step === 'choose') return
    dialogRef.current.querySelector<HTMLElement>('.coffee__title')?.focus()
  }, [step])

  const choose = (o: Order) => {
    setOrder(o)
    setLine(0)
    setStep(reduced ? 'served' : 'brewing')
  }

  const reset = () => {
    setStep('choose')
    setOrder(null)
    setLine(0)
  }

  const handleClose = () => {
    document.documentElement.style.overflow = ''
    if (step === 'served') setServed((n) => n + 1)
    reset()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="coffee"
      aria-labelledby="coffee-title"
      onClose={handleClose}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (e.target === e.currentTarget) dialogRef.current?.close()
      }}
    >
      <div className="coffee__inner">
        <figure className="coffee__figure">
          <img
            src={ASSETS.coffeeWebp}
            width={419}
            height={477}
            alt="Jeff, in a suit and red tie, holding a briefcase and offering an iced coffee."
            loading="lazy"
            data-step={step}
          />
          <figcaption className="mono">Fig. 06 — Coffee, offered</figcaption>
        </figure>

        <div className="coffee__body" aria-live="polite">
          <button type="button" className="coffee__close mono" onClick={() => dialogRef.current?.close()}>
            Close <span aria-hidden="true">×</span>
          </button>

          {step === 'choose' && (
            <div className="coffee__step" key="choose">
              <p className="mono coffee__eyebrow">{served > 0 ? 'Back so soon' : 'The executive lounge'}</p>
              <h2 id="coffee-title" className="coffee__title display" tabIndex={-1}>
                Jeff will see you <em>now.</em>
              </h2>
              <p className="coffee__copy">
                He has cleared twenty minutes in his calendar. He intends to spend eighteen of them looking out of the
                window. What will you have?
              </p>
              <ul className="coffee__orders">
                {COFFEE_ORDERS.map((o) => (
                  <li key={o.id}>
                    <button type="button" className="coffee__order" onClick={() => choose(o)}>
                      <span className="coffee__order-label">{o.label}</span>
                      <span className="coffee__order-note">{o.note}</span>
                      <ArrowIcon />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 'brewing' && (
            <div className="coffee__step" key="brewing">
              <p className="mono coffee__eyebrow">Now preparing</p>
              <h2 id="coffee-title" className="coffee__title display" tabIndex={-1}>
                {order?.label}
              </h2>
              <p className="coffee__status mono">{BREW_LINES[line]}</p>
              <div className="coffee__progress" aria-hidden="true">
                <span />
              </div>
              <button type="button" className="link" onClick={() => setStep('served')}>
                <span className="link__text">Skip the ceremony</span>
              </button>
            </div>
          )}

          {step === 'served' && (
            <div className="coffee__step" key="served">
              <p className="mono coffee__eyebrow">Served</p>
              <h2 id="coffee-title" className="coffee__title display" tabIndex={-1}>
                Your {order?.label.toLowerCase() ?? 'coffee'} is <em>ready.</em>
              </h2>
              <p className="coffee__copy">
                {order?.note} Jeff would love to hear about your work. He will be with you after his two o’clock nap,
                which runs until approximately five.
              </p>
              <div className="coffee__actions">
                <button type="button" className="btn" onClick={reset}>
                  <span>Another round</span>
                  <span className="btn__icon">
                    <ArrowIcon />
                  </span>
                </button>
                <button type="button" className="link" onClick={() => dialogRef.current?.close()}>
                  <span className="link__text">Return to the portfolio</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}
