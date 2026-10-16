import { useEffect } from 'react'
import { unlockMotion } from '../lib/tilt.js'
import { assetUrl } from '../lib/format.js'

export function Splash({ onDone }) {
  /*
   * The hold used to be 4.2s because the line typed itself out over most of
   * it. With the line gone there is nothing to wait for, so the mark shows
   * just long enough to register and the app opens behind it.
   */
  useEffect(() => {
    const doneTimer = window.setTimeout(onDone, 1800)
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
