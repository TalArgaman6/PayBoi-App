import { useEffect, useState } from 'react'
import { needsMotionPrompt, unlockMotion } from '../lib/tilt.js'
import { PboiLogo } from './Logo.jsx'

const LINE = 'a new lgbtq economy'

export function Splash({ onDone }) {
  const [shown, setShown] = useState('')
  const [typed, setTyped] = useState(false)
  const [denied, setDenied] = useState(false)
  const ask = needsMotionPrompt()

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

    const doneTimer = ask ? 0 : window.setTimeout(onDone, 4200)
    return () => {
      window.clearInterval(typeTimer)
      if (doneTimer) window.clearTimeout(doneTimer)
    }
  }, [ask, onDone])

  function allowTilt() {
    const pending = unlockMotion()
    pending.then((ok) => {
      if (ok) onDone()
      else setDenied(true)
    })
  }

  const mark = (
    <span className="splash-mark" aria-hidden="true">
      <PboiLogo />
    </span>
  )
  const foot = (
    <div className="splash-foot">
      {ask && typed ? (
        <button type="button" className="splash-tilt" onClick={allowTilt}>
          {denied ? 'Allow tilt to continue' : 'Allow tilt'}
        </button>
      ) : null}
      {denied ? (
        <p className="splash-tilt-note">Motion access is still off.</p>
      ) : null}
      <p className="splash-line">
        {shown}
        {typed && ask ? null : <i />}
      </p>
    </div>
  )

  if (ask) {
    return (
      <div className="splash">
        {mark}
        {foot}
      </div>
    )
  }

  return (
    <button type="button" className="splash" onClick={onDone} aria-label="Open pboi">
      {mark}
      {foot}
    </button>
  )
}
