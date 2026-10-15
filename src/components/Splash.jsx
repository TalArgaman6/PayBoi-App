import { useEffect, useState } from 'react'
import { unlockMotion } from '../lib/tilt.js'
import { CrestStack } from './Logo.jsx'

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
   * The wordmark is set in Cormorant, which arrives over the network with
   * `display=swap` — so the lockup drew itself in Didot first and jumped when
   * the real face landed. It waits here instead, and fades in once the fonts
   * are in. The timer is the floor under it: a face that never loads must not
   * cost the mark its whole appearance.
   */
  const [lettered, setLettered] = useState(false)

  useEffect(() => {
    let live = true
    const settle = () => {
      if (live) setLettered(true)
    }
    const floor = window.setTimeout(settle, 600)
    document.fonts?.ready.then(settle)
    return () => {
      live = false
      window.clearTimeout(floor)
    }
  }, [])

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
      <span
        className={`splash-mark${lettered ? ' is-lettered' : ''}`}
        aria-hidden="true"
      >
        <CrestStack />
      </span>
    </button>
  )
}
