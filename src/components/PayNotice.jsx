import { useEffect, useState } from 'react'
import { onMovement } from '../lib/balance.js'

/*
 * The strip a digital wallet drops at the top of the phone when money moves.
 * It is not a dialog and it is not asking anything: it is a receipt, so it
 * arrives on its own, says the one thing it has to say, and leaves. Every
 * path that moves the balance announces through the store, so this listens in
 * one place rather than being hung off each of them.
 *
 * It lives inside the phone shell rather than over the whole page, because
 * the thing it is imitating is a system notice on a device and the device
 * here is the frame.
 */
const DWELL = 3200

export function PayNotice() {
  // The movement on screen, and whether it is on its way out. Two pieces
  // rather than one, so the strip can play its exit with the figures still
  // in it — clearing the movement first would leave an empty bar sliding up.
  const [note, setNote] = useState(null)
  const [going, setGoing] = useState(false)

  useEffect(
    () =>
      onMovement((movement) => {
        setGoing(false)
        setNote(movement)
      }),
    [],
  )

  /*
   * Keyed on the movement's own id, so a second payment landing while the
   * first is still up restarts the clock rather than inheriting what was
   * left of it. The dwell is the whole life of the strip; the last 420ms of
   * it are spent leaving.
   */
  useEffect(() => {
    if (!note) return undefined
    const out = window.setTimeout(() => setGoing(true), DWELL - 420)
    const gone = window.setTimeout(() => {
      setNote(null)
      setGoing(false)
    }, DWELL)
    return () => {
      window.clearTimeout(out)
      window.clearTimeout(gone)
    }
  }, [note?.id])

  if (!note) return null

  const out = note.way === 'out'

  return (
    <div
      className={`pay-notice is-${note.way}${going ? ' is-going' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="pay-notice-mark" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          {/* An arrow out of the wallet or into it — one glyph turned over,
              so the two read as a pair rather than as two icons. Money
              coming in points up and money going out points down, the way a
              transfer list reads — they were the wrong way round. */}
          <path
            d={out ? 'M8 3v10' : 'M8 13V3'}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d={out ? 'M4.4 9.4 8 13l3.6-3.6' : 'M4.4 6.6 8 3l3.6 3.6'}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="pay-notice-copy">
        <strong>
          {out ? '−' : '+'}
          {note.amount.toLocaleString()} pck
        </strong>
        <em>{note.label || (out ? 'Paid from your wallet' : 'Received in your wallet')}</em>
      </span>
    </div>
  )
}
