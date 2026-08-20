import { useEffect, useState } from 'react'

const LINE = 'a new lgbtq economy'

export function Splash({ onDone }) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    let index = 0
    const typeTimer = window.setInterval(() => {
      index += 1
      setShown(LINE.slice(0, index))
      if (index >= LINE.length) {
        window.clearInterval(typeTimer)
      }
    }, 55)

    const doneTimer = window.setTimeout(onDone, 4200)
    return () => {
      window.clearInterval(typeTimer)
      window.clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <button type="button" className="splash" onClick={onDone} aria-label="Open pboi">
      <span className="splash-letters" aria-hidden="true">
        <b>p</b>
        <span>b</span>
        <span>o</span>
        <span>i</span>
      </span>
      <p className="splash-line">
        {shown}
        <i />
      </p>
    </button>
  )
}
