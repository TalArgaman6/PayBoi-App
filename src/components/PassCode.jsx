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
  // One card per pass still in hand, minus the one on top.
  const behind = Math.min(Math.max(remainingCount(gift) - 1, 0), STACK_MAX)
  const people = useMemo(following, [])
  const [markup, setMarkup] = useState('')
  const [ghosts, setGhosts] = useState([])
  const [qrInset, setQrInset] = useState('0px')
  const [qrInk, setQrInk] = useState('108px')
  const [picking, setPicking] = useState(false)
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState(null)
  const shown = people.filter((person) =>
    person.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  // The codes under the top one, one per pass still in hand.
  const under = useMemo(
    () => remainingTokens(gift).slice(1, STACK_MAX + 1),
    [gift, token],
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
    })
    return () => {
      cancel = true
    }
  }, [token, under])

  function closePick() {
    setPicking(false)
    setQuery('')
    setPending(null)
  }

  function confirmGrant() {
    if (!pending || !token || !redeemPass(token, [gift])) return
    closePick()
    onGranted?.()
  }

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
        <div className="gift-pass-deck" style={{ '--deck': behind }}>
          {ghosts.slice(0, behind).map((svg, index) => (
            <div
              key={under[index] || index}
              className="gift-pass-ghost"
              style={{ '--depth': index + 1 }}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ))}
          <div
            className="gift-pass-code"
            role="img"
            aria-label={`${gift.label} pass`}
            dangerouslySetInnerHTML={{ __html: markup }}
          />
        </div>
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
      {/* Which pass this is of the holding, rather than "one" — the deck
          beside it already says there are several, and this says how many
          and that the code on top is the first of them. */}
      <small>
        Scan to use 1 / {remainingCount(gift)}
      </small>
      {picking ? (
        <div className="gift-pop" role="presentation" onClick={closePick}>
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
