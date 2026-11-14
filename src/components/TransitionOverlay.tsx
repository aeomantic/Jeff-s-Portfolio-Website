import './TransitionOverlay.css'

export type OverlayMode = 'hidden' | 'pop' | 'reveal'

/**
 * The "playful pop" between the rave and the coffee break: a blush ring and
 * then a cream circle burst out of the cat and cover the screen, then fade
 * away over the cosy scene underneath.
 */
export function TransitionOverlay({ mode }: { mode: OverlayMode }) {
  return (
    <div className="transition" data-mode={mode} aria-hidden="true">
      <span className="transition__circle transition__circle--blush" />
      <span className="transition__circle transition__circle--cream" />
    </div>
  )
}
