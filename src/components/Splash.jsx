import { useEffect } from 'react'
import { unlockMotion } from '../lib/tilt.js'
import { assetUrl } from '../lib/format.js'

export function Splash({ onDone }) {
  /*
   * Three seconds. Long enough for the mark to be looked at rather than
   * glimpsed — at 1.8s it was gone before anyone had read it. A tap still
   * skips the rest of the hold, so nobody who has seen it is kept waiting.
   */
  useEffect(() => {
    const doneTimer = window.setTimeout(onDone, 3000)
    return () => window.clearTimeout(doneTimer)
  }, [onDone])

  /*
   * The lockup used to be drawn — a crest in SVG over a wordmark set in
   * Cormorant — which meant waiting for the face to arrive before it could be
   * shown, or watching it redraw itself in Didot. It is the icon's own
   * artwork now, so there is nothing to wait for: an image either is there or
   * is being decoded, and either way it never changes shape.
   */
  return (
    <button
      type="button"
      className="splash"
      aria-label="Open Peacock"
      onClick={() => {
        unlockMotion()
        onDone()
      }}
    >
      <span className="splash-mark" aria-hidden="true">
        <img src={assetUrl('brand/pck-lockup.png')} alt="" decoding="async" />
      </span>
    </button>
  )
}
