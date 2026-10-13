import { useEffect, useState } from 'react'
import { unlockMotion } from '../lib/tilt.js'
import { PeacockLogo } from './Logo.jsx'

const LINE = 'a new lgbt economy'

export function Splash({ onDone }) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    let index = 0
    const typeTimer = window.setInterval(() => {
      index += 1
      setShown(LINE.slice(0, index))
      if (index >= LINE.length) window.clearInterval(typeTimer)
    }, 55)

    const doneTimer = window.setTimeout(onDone, 4200)
    return () => {
      window.clearInterval(typeTimer)
      window.clearTimeout(doneTimer)
    }
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
        <PeacockLogo />
      </span>
      <p className="splash-line">
        <span className="splash-line-ghost" aria-hidden="true">
          {LINE}
        </span>
        <span className="splash-line-live">
          {shown}
          {/* A full stop, not a caret — it only belongs once the line is written. */}
          {shown.length >= LINE.length ? <i /> : null}
        </span>
      </p>
    </button>
  )
}
