import { useState, type Ref } from 'react'
import { ASSETS } from '../config'

interface SpinningCatProps {
  bodyRef: Ref<HTMLDivElement>
  ghost1Ref: Ref<HTMLDivElement>
  ghost2Ref: Ref<HTMLDivElement>
  shadeRef: Ref<HTMLImageElement>
  shadowRef: Ref<HTMLDivElement>
}

/**
 * The OIIA cat: a transparent cutout spun around its vertical axis like a
 * card on a turntable (which is exactly how the meme looks). Two tinted
 * "ghost" copies trail behind at speed as a cheap motion blur, and a
 * silhouette overlay darkens the card as it turns edge-on.
 *
 * Every transform is written directly by the rave loop through these refs;
 * React never re-renders per frame.
 */
export function SpinningCat({ bodyRef, ghost1Ref, ghost2Ref, shadeRef, shadowRef }: SpinningCatProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="cat-pop">
      <div className="cat-shadow" ref={shadowRef} aria-hidden="true" />
      {failed ? (
        <div
          className="cat-body cat-body--missing"
          ref={bodyRef}
          role="img"
          aria-label="Spinning cat (image failed to load)"
        >
          <span aria-hidden="true">🐱</span>
          <small>The cat is shy today.</small>
        </div>
      ) : (
        <>
          <div className="cat-ghost cat-ghost--pink" ref={ghost1Ref} aria-hidden="true">
            <img src={ASSETS.spinningCat} alt="" draggable={false} />
          </div>
          <div className="cat-ghost cat-ghost--cyan" ref={ghost2Ref} aria-hidden="true">
            <img src={ASSETS.spinningCat} alt="" draggable={false} />
          </div>
          <div className="cat-body" ref={bodyRef}>
            <img
              className="cat-img"
              src={ASSETS.spinningCat}
              alt="A chubby tabby cat with white paws, spinning to the music"
              draggable={false}
              onError={() => setFailed(true)}
            />
            <img
              className="cat-shade"
              ref={shadeRef}
              src={ASSETS.spinningCat}
              alt=""
              draggable={false}
              aria-hidden="true"
            />
          </div>
        </>
      )}
    </div>
  )
}
