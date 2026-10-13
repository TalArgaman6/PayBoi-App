import { useEffect } from 'react'
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
        <CrestStack />
      </span>
    </button>
  )
}
