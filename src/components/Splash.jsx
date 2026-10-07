import { useEffect, useState } from 'react'
import { unlockMotion } from '../lib/tilt.js'
import { PboiLogo } from './Logo.jsx'

const LINE = 'a new lgbtq economy'

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
      aria-label="Open pboi"
      onClick={() => {
        unlockMotion()
        onDone()
      }}
    >
      <span className="splash-mark" aria-hidden="true">
        <PboiLogo />
      </span>
      <p className="splash-line">
        <span className="splash-line-ghost" aria-hidden="true">
          {LINE}
        </span>
        <span className="splash-line-live">
          {shown}
          <i />
        </span>
      </p>
    </button>
  )
}
