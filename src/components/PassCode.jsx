import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import catalog from '../data/feed.json'
import { assetUrl } from '../lib/format.js'
import {
  nextPassToken,
  passUrl,
  redeemPass,
  remainingCount,
  remainingTokens,
} from '../lib/passes.js'

/*
 * How many passes deep the stack is allowed to look. Past five the slivers
 * stop reading as separate cards and start reading as a fat edge, so a
 * thicker holding is drawn as five and the count beside it does the talking.
 */
const STACK_MAX = 5

function following() {
  const people = new Map()
  for (const post of catalog.posts) {
    for (const person of [post.user, ...(post.with || [])]) {
      if (!person || person.id === 'tal' || people.has(person.id)) continue
      people.set(person.id, person)
    }
  }
  return [...people.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function PassCode({ gift, onGranted }) {
  const token = nextPassToken(gift)
  // How many of the perk are in hand right now. Read on every render, because
  // it moves under this card from two directions — a read spends one, and
  // pressing the row's mark adds one.
  const held = remainingCount(gift)
  // One card per pass still in hand, minus the one on top.
  const behind = Math.min(Math.max(held - 1, 0), STACK_MAX)
  const people = useMemo(following, [])
  const [markup, setMarkup] = useState('')
  /*
   * Which pass the drawn code belongs to. Rendering a QR is a promise, so for
   * a frame or two after the holding changes the element still holds the
   * previous pass's markup — and a spent code that has just faded out would
   * come back at full strength for exactly that long. The card shows nothing
   * until the ink matches the pass.
   */
  const [drawn, setDrawn] = useState(null)
  const [ghosts, setGhosts] = useState([])
  const [qrInset, setQrInset] = useState('0px')
  const [qrInk, setQrInk] = useState('108px')
  const [picking, setPicking] = useState(false)
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState(null)
  // The popup on its way out. Confirming used to take it off the screen in a
  // frame, which read as the card being snatched away; it fades instead, and
  // only leaves the tree once the fade is over.
  const [leaving, setLeaving] = useState(false)
  /*
   * A pass being read. Idle until the line under the code is pressed, waiting
   * while the reader finds it — two seconds of nothing, which is what the
   * door feels like — then running while the beam walks down the card, then
   * done. The pass is spent at the end of the walk rather than on the press:
   * nothing is used up until the code has actually been read.
   */
  const [scan, setScan] = useState('idle')
  const shown = people.filter((person) =>
    person.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  // The codes under the top one, one per pass still in hand.
  /*
   * Keyed on the holding as well as the top card. Coming by another pass does
   * not change which code is on top, so on `token` alone this never ran again
   * and the deck behind it kept the length it had — the new sliver had a slot
   * in the pile and no code to draw in it. The count is the thing that
   * changed, so the count is what it watches.
   */
  const under = useMemo(
    () => remainingTokens(gift).slice(1, STACK_MAX + 1),
    [gift, token, held],
  )

  useEffect(() => {
    if (!token) return undefined
    let cancel = false
    const options = {
      type: 'svg',
      errorCorrectionLevel: 'M',
      color: { dark: '#ffffff', light: '#00000000' },
    }
    /*
     * The live card and the deck behind it. The live one keeps its one-module
     * quiet zone, which is what a scanner wants. The ones behind are drawn
     * without one, because all that ever shows of them is a single pixel off
     * their left edge — and with a quiet zone that pixel is blank. Each is its
     * own pass, so each is its own code: the slivers differ down the stack the
     * way the passes do.
     */
    Promise.all([
      QRCode.toString(passUrl(token), { ...options, margin: 1 }),
      ...under.map((next) =>
        QRCode.toString(passUrl(next), { ...options, margin: 0 }),
      ),
    ]).then(([svg, ...bare]) => {
      if (cancel) return
      // viewBox units are modules, quiet zone included, across the 108px the
      // card leaves inside its 6px padding.
      const modules = Number(/viewBox="0 0 (\d+)/.exec(svg)?.[1] || 0)
      if (modules) {
        setQrInset(`calc(6px + (120px - 12px) / ${modules})`)
        setQrInk(`calc((120px - 12px) * ${(modules - 2) / modules})`)
      }
      setMarkup(svg)
      setGhosts(bare)
      setDrawn(token)
    })
    return () => {
      cancel = true
    }
  }, [token, under])

  useEffect(() => {
    if (scan !== 'waiting' && scan !== 'running') return undefined
    const timer = window.setTimeout(
      () => setScan(scan === 'waiting' ? 'running' : 'done'),
      scan === 'waiting' ? 2000 : 1500,
    )
    return () => window.clearTimeout(timer)
  }, [scan])

  /*
   * The read is what spends it, so the count beside the deck drops as the
   * beam leaves the bottom of the code rather than as it arrives at the top.
   * The spent code goes with it: it fades off the card, and only once it has
   * gone is the pass actually marked used, which is what brings the next one
   * up. Redeeming any earlier would swap the markup mid-fade and the code
   * fading out would be the new one.
   */
  // The pause after a grant is confirmed: the popup is already gone and the
  // code is still standing, for a second, before it goes the way a read sends
  // it.
  useEffect(() => {
    if (scan !== 'handing') return undefined
    const timer = window.setTimeout(() => setScan('done'), 1000)
    return () => window.clearTimeout(timer)
  }, [scan])

  useEffect(() => {
    if (scan !== 'done' || !token) return undefined
    const timer = window.setTimeout(() => {
      redeemPass(token, [gift])
      setScan('fresh')
    }, 520)
    return () => window.clearTimeout(timer)
  }, [scan])

  // The next pass, arriving. A beat on its own state so it can come up rather
  // than appear, after which the card is idle and ready to be read again.
  useEffect(() => {
    if (scan !== 'fresh') return undefined
    const timer = window.setTimeout(() => setScan('idle'), 420)
    return () => window.clearTimeout(timer)
  }, [scan])

  function closePick() {
    setPicking(false)
    setQuery('')
    setPending(null)
  }

  /*
   * Giving one away is the same loss as using one, so it looks the same: the
   * popup goes, the code on the card fades off it and the next pass is
   * standing underneath. The pass is spent at the end of that, by the same
   * run of states a read goes through — handing the row straight back to the
   * wallet, the way this used to, meant the only thing you saw was the row
   * closing. The row stays open and shows you what left it.
   */
  function confirmGrant() {
    if (!pending || !token) return
    setLeaving(true)
    // A beat with the popup gone and the card still whole, so the handover
    // reads as a consequence of the confirm rather than as part of it.
    setScan('handing')
  }

  useEffect(() => {
    if (!leaving) return undefined
    const timer = window.setTimeout(() => {
      setLeaving(false)
      closePick()
    }, 420)
    return () => window.clearTimeout(timer)
  }, [leaving])

  if (!token) {
    return <p className="gift-pass-note">None left</p>
  }

  return (
    <div
      className="gift-pass"
      style={{ '--qr-inset': qrInset, '--qr-ink': qrInk }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div className="gift-pass-side">
        {/* The deck. Each pass behind the live one is the same code shifted a
            pixel further left, so a holding of four reads as four without
            needing a number. Each copy is clipped to the single pixel it is
            meant to show — the code is white on nothing, so an unclipped one
            underneath would shine through the top card's gaps and muddy its
            modules. Drawn before it in the DOM so it covers them. */}
        {/*
          * `is-blank` is the deck saying its live code is not drawn yet — the
          * next pass's square stays open underneath for exactly as long as
          * that is true, so there is never a frame with no code on the card
          * and never a frame with two different ones on it.
          */}
        <div
          className={`gift-pass-deck is-${scan}${drawn === token ? '' : ' is-blank'}`}
          style={{ '--deck': behind }}
        >
          {ghosts.slice(0, behind).map((svg, index) => (
            <div
              key={under[index] || index}
              className={`gift-pass-ghost${index === 0 ? ' is-next' : ''}`}
              style={{ '--depth': index + 1 }}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ))}
          <div
            className={`gift-pass-code${drawn === token ? '' : ' is-blank'}`}
            role="img"
            aria-label={`${gift.label} pass`}
            dangerouslySetInnerHTML={{ __html: markup }}
          />
          {/* The reader's line, drawn only while it is crossing — there is
              nothing to see on a code that has not been read yet, and
              nothing left to read on one that has. */}
          {scan === 'running' ? (
            <div className="pass-laser" aria-hidden="true" />
          ) : null}
        </div>
      </div>
      {/* The foot: how many are in hand and where to send one. The hand-off
          mark sits beside the line rather than beside the code, so the two
          things you can do with a pass read as one row under it. */}
      <div className="gift-pass-foot">
        <button
          type="button"
          className="gift-pass-scan"
          disabled={scan !== 'idle' && scan !== 'fresh'}
          onClick={() => setScan('waiting')}
        >
          Scan to use 1 / {held}
        </button>
        <span className="gift-pass-or" aria-hidden="true">or</span>
        <button
          type="button"
          className="gift-grant"
          aria-label={`Grant ${gift.label}`}
          aria-expanded={picking}
          onClick={() => setPicking(true)}
        >
          <svg viewBox="0 0 20 16" aria-hidden="true">
            <circle cx="5.4" cy="4.6" r="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="M1.6 13c.4-2.2 1.7-3.3 3.8-3.3s3.4 1.1 3.8 3.3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M13.2 8h4.2M15.6 6.2 17.6 8l-2 1.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {picking ? (
        <div
          className={`gift-pop${leaving ? ' is-leaving' : ''}`}
          role="presentation"
          onClick={leaving ? undefined : closePick}
        >
          <div
            className="gift-pop-card"
            role="dialog"
            aria-label={pending ? `Grant ${gift.label} to ${pending.name}` : `Grant ${gift.label}`}
            onClick={(event) => event.stopPropagation()}
          >
            {pending ? (
              <div className="gift-pop-confirm">
                <img src={assetUrl(pending.photo)} alt="" />
                <p>Grant {gift.label} to {pending.name}?</p>
                <div className="gift-pop-actions">
                  <button type="button" onClick={() => setPending(null)}>Cancel</button>
                  <button type="button" className="is-confirm" onClick={confirmGrant}>Confirm</button>
                </div>
              </div>
            ) : (
              <>
                <input
                  className="gift-pop-search"
                  type="search"
                  placeholder="Search"
                  value={query}
                  autoFocus
                  onChange={(event) => setQuery(event.target.value)}
                />
                <div className="gift-pop-list">
                  {shown.map((person) => (
                    <button key={person.id} type="button" onClick={() => setPending(person)}>
                      <img src={assetUrl(person.photo)} alt="" />
                      {person.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
