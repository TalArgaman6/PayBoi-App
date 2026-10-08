import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import catalog from '../data/feed.json'
import { assetUrl } from '../lib/format.js'
import { nextPassToken, passUrl, redeemPass } from '../lib/passes.js'

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
  const people = useMemo(following, [])
  const [markup, setMarkup] = useState('')
  const [picking, setPicking] = useState(false)
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState(null)
  const shown = people.filter((person) =>
    person.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  useEffect(() => {
    if (!token) return undefined
    let cancel = false
    QRCode.toString(passUrl(token), {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#ffffff', light: '#00000000' },
    }).then((svg) => {
      if (!cancel) setMarkup(svg)
    })
    return () => {
      cancel = true
    }
  }, [token])

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
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div className="gift-pass-side">
        <div
          className="gift-pass-code"
          role="img"
          aria-label={`${gift.label} pass`}
          dangerouslySetInnerHTML={{ __html: markup }}
        />
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
      <small>Scan to use one</small>
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
