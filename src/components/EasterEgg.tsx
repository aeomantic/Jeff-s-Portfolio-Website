import { ASSETS } from '../content/site'
import { useExecutive } from '../motion/executive'
import './EasterEgg.css'

/**
 * What appears while Executive Mode is off: a spinning Jeff and a polite note
 * that professionalism will resume shortly. The live region is always mounted
 * so the change is announced.
 */
export function EasterEgg() {
  const { off, restore } = useExecutive()
  return (
    <div className="egg" data-active={off ? '' : undefined}>
      <div className="egg__live sr-only" aria-live="polite">
        {off ? 'Executive Mode is off. Professionalism will resume shortly.' : ''}
      </div>
      {off && (
        <div className="egg__toast">
          <img className="egg__cat" src={ASSETS.spinning} width={349} height={486} alt="" />
          <div className="egg__text">
            <p className="mono egg__eyebrow">Executive Mode: Off</p>
            <p className="egg__message">Professionalism will resume shortly.</p>
            <span className="egg__timer" aria-hidden="true" />
          </div>
          <button type="button" className="egg__restore mono" onClick={restore}>
            Restore now
          </button>
        </div>
      )}
    </div>
  )
}
