import { useEffect, useState } from 'react'
import { unlockMotion } from '../lib/tilt.js'
import { PboiLogo } from './Logo.jsx'

const LINE = 'a new lgbtq economy'

export function Splash({ onDone }) {
  const [shown, setShown] = useState('')
  const [typed, setTyped] = useState(false)

  useEffect(() => {
    let index = 0
    const typeTimer = window.setInterval(() => {
      index += 1
      setShown(LINE.slice(0, index))
      if (index >= LINE.length) {
        window.clearInterval(typeTimer)
        setTyped(true)
      }
    }, 55)

    return () => window.clearInterval(typeTimer)
  }, [])

  function allowTilt() {
    unlockMotion().then((ok) => {
      if (ok) onDone()
    })
  }

  return (
    <div className="splash">
      <span className="splash-mark" aria-hidden="true">
        <PboiLogo />
      </span>
      <div className="splash-foot">
        <p className="splash-line">
          {shown}
          {typed ? null : <i />}
        </p>
        {typed ? (
          <button type="button" className="splash-tilt" onClick={allowTilt}>
            Confirm terms
          </button>
        ) : null}
      </div>
    </div>
  )
}
