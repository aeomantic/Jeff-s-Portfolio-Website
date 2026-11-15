import { useExecutive } from '../motion/executive'
import './ExecutiveToggle.css'

/** The discreet Easter-egg switch. It appears in a few places; all share one state. */
export function ExecutiveToggle({ className = '' }: { className?: string }) {
  const { off, disable, restore } = useExecutive()
  return (
    <button
      type="button"
      className={`exec-toggle mono ${className}`}
      aria-pressed={off}
      onClick={off ? restore : disable}
    >
      <span className="exec-toggle__track" aria-hidden="true">
        <span className="exec-toggle__thumb" />
      </span>
      <span>{off ? 'Restore Executive Mode' : 'Executive Mode: Off'}</span>
    </button>
  )
}
