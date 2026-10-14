import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BottomNav } from './components/BottomNav.jsx'
import { ItemThumb } from './components/ItemRow.jsx'
import { RemixProvider } from './components/RemixPlayer.jsx'
import { Splash } from './components/Splash.jsx'
import wallet from './data/wallet.json'
import { formatCost, formatPbs, formatTokenBalance } from './lib/format.js'
import { rankVars } from './lib/settings.js'
import { spendOver, useBalance } from './lib/balance.js'
import { consumeLocationRedeem } from './lib/passes.js'
import { useDismissOnOutside } from './lib/dismiss.js'
import { useWalletTilt } from './lib/tilt.js'
import { EventsScreen } from './screens/EventsScreen.jsx'
import { CrestLoader } from './components/CrestLoader.jsx'
import { FeedScreen } from './screens/FeedScreen.jsx'
import { MarketplaceScreen } from './screens/MarketplaceScreen.jsx'
import { ShopScreen } from './screens/ShopScreen.jsx'
import { WalletScreen } from './screens/WalletScreen.jsx'
import './App.css'

const redeemedPassId = consumeLocationRedeem(wallet.gifts)

/*
 * The bars on the back of a paid sheet. Not a real symbology — nothing here
 * is scanned — but the widths have to look like one, so they come out of the
 * item's own id rather than out of Math.random: the same purchase always
 * draws the same code, which is what a receipt does.
 */
function barsFor(id) {
  let seed = 0
  for (const ch of String(id)) seed = (seed * 31 + ch.charCodeAt(0)) % 100000
  const bars = []
  let x = 0
  while (x < 236) {
    seed = (seed * 1103515245 + 12345) % 2147483648
    const width = 1 + (seed >> 16) % 4
    seed = (seed * 1103515245 + 12345) % 2147483648
    const gap = 1 + (seed >> 16) % 3
    if (x + width > 236) break
    bars.push({ x, width })
    x += width + gap
  }
  return bars
}

function codeFor(id) {
  let seed = 7
  for (const ch of String(id)) seed = (seed * 131 + ch.charCodeAt(0)) % 1000000007
  const digits = String(seed).padStart(12, '0').slice(-12)
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`
}

function pmName(seller) {
  const first = String(seller?.name || '').trim().split(/\s+/)[0]
  if (!first) return ''
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

export default function App() {
  const [booted, setBooted] = useState(Boolean(redeemedPassId))
  const [tab, setTab] = useState(redeemedPassId ? 'wallet' : 'events')
  const [selected, setSelected] = useState(null)
  const [pmOpen, setPmOpen] = useState(false)
  const [pmDraft, setPmDraft] = useState('')
  const [pmSent, setPmSent] = useState(false)
  // Paid: the sheet turns over and its other side is the code — or, when the
  // seller is a person rather than the app, the wait for them to accept.
  const [paid, setPaid] = useState(false)
  const [approved, setApproved] = useState(false)
  const balance = useBalance()
  const phone = useRef(null)
  const detail = useRef(null)
  // Where the press that opened the sheet landed, in phone coordinates.
  const anchor = useRef(null)
  // The top the sheet was placed at when it opened, and the item it opened
  // for. Steps taken inside the sheet — the PM composer, then its sent state —
  // are the same sheet, so they stay at the place it opened in rather than
  // being re-anchored to the button that was pressed inside it.
  const placed = useRef(null)
  const placedFor = useRef(null)
  const [sheetTop, setSheetTop] = useState(null)
  useWalletTilt(phone, booted)
  useDismissOnOutside(detail, Boolean(selected), closeDetail)

  useEffect(() => {
    setPmOpen(false)
    setPmDraft('')
    setPmSent(false)
    setPaid(false)
    setApproved(false)
  }, [selected?.id])

  /*
   * Which purchases wait instead of turning over to a code — five seconds
   * on the crest, then it clears, the sheet closes and the balance counts
   * itself down on the card. The charge happens on the approval rather than
   * on the press: nothing is taken while the deal could still fall through.
   * A deal with a person waits, and so does anything bought from the wallet —
   * a top-up is money moving between balances, not a ticket being issued, so
   * what it owes you is the new figure on the card rather than a code.
   */
  const waits = Boolean(selected?.seller) || tab === 'wallet'

  useEffect(() => {
    if (!paid || !waits || approved) return undefined
    const price = selected.pricePbs
    const timer = window.setTimeout(() => {
      setApproved(true)
      setSelected(null)
      setTab('wallet')
      spendOver(price)
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [paid, approved, waits, selected?.id])

  /*
   * Every press inside the phone records the row it hit. Doing it here rather
   * than threading a rect through every onSelect means the anchor works the
   * same whether the sheet was opened from a list row, a coin or a banner.
   */
  useEffect(() => {
    const node = phone.current
    if (!booted || !node) return undefined

    function remember(event) {
      const hit = event.target.closest?.('button, [role="button"]')
      if (!hit || !node.contains(hit)) {
        anchor.current = null
        return
      }
      const box = hit.getBoundingClientRect()
      const frame = node.getBoundingClientRect()
      anchor.current = { top: box.top - frame.top, bottom: box.bottom - frame.top }
    }

    node.addEventListener('pointerdown', remember, true)
    return () => node.removeEventListener('pointerdown', remember, true)
  }, [booted])

  /*
   * Open the sheet just under the row it came from, then pull it back inside
   * the phone if it would run off either end. Measured after paint because we
   * need the sheet's real height, which depends on how long the title wraps.
   */
  useLayoutEffect(() => {
    if (!selected) {
      placed.current = null
      placedFor.current = null
      setSheetTop(null)
      return
    }

    const node = detail.current
    const frame = phone.current
    if (!node || !frame) {
      setSheetTop(null)
      return
    }

    const height = node.offsetHeight
    const limit = frame.clientHeight
    const GAP = 10
    const TOP_EDGE = 12
    // Clear of the tab bar at the bottom.
    const BOTTOM_EDGE = 84

    // A new sheet anchors to the row that opened it. A sheet that is already
    // up — the PM composer taking over its body — keeps the top it was given,
    // because the last press was the PM button inside it and anchoring to that
    // would drop the sheet a step down the screen every time.
    if (placedFor.current !== selected.id) {
      const from = anchor.current
      if (!from) {
        placed.current = null
        placedFor.current = null
        setSheetTop(null)
        return
      }
      let open = from.bottom + GAP
      if (open + height > limit - BOTTOM_EDGE) {
        // No room below: try above the row before falling back to pinned.
        open = Math.min(from.top - GAP - height, limit - BOTTOM_EDGE - height)
      }
      placed.current = open
      placedFor.current = selected.id
    } else if (placed.current === null) {
      return
    }

    // Clamped off the remembered top rather than off the last one, so a step
    // that grows the sheet past the tab bar is pulled up for as long as it is
    // tall and then falls back to where it started.
    let top = placed.current
    if (top + height > limit - BOTTOM_EDGE) {
      top = limit - BOTTOM_EDGE - height
    }
    setSheetTop(Math.max(TOP_EDGE, top))
  }, [selected?.id, pmOpen, pmSent, paid])

  function closeDetail() {
    setSelected(null)
  }

  if (!booted) {
    return (
      <div className="stage">
        <div className="phone">
          <Splash onDone={() => setBooted(true)} />
        </div>
      </div>
    )
  }

  return (
    <div className="stage">
      <div
        className="phone"
        data-tab={tab}
        ref={phone}
        style={rankVars(balance, { premium: wallet.premium })}
      >
        <RemixProvider>
          {tab === 'events' ? <EventsScreen onSelect={setSelected} /> : null}
          {tab === 'shop' ? <ShopScreen onSelect={setSelected} /> : null}
          {tab === 'marketplace' ? (
            <MarketplaceScreen onSelect={setSelected} />
          ) : null}
          {/* Selling into a request pays out, and a payout belongs on the
              card — so the feed can send the viewer there once a deal
              clears, the same way a purchase does. */}
          {tab === 'feed' ? <FeedScreen onPaid={() => setTab('wallet')} /> : null}
          {tab === 'wallet' ? (
            <WalletScreen onSelect={setSelected} openedPass={redeemedPassId} />
          ) : null}
          <BottomNav tab={tab} onChange={setTab} />
          {selected ? (
            <aside
              ref={detail}
              className={`detail-sheet${paid ? ' is-paid' : ''}`}
              role="dialog"
              aria-label={selected.title}
              style={
                sheetTop === null
                  ? undefined
                  : { top: `${sheetTop}px`, bottom: 'auto' }
              }
            >
              {/* The whole sheet turns over on Pay Now, top edge away, and the
                  code is simply its other side — same card, same ground, so
                  nothing opens on top of anything. The two faces are stacked
                  in one grid cell, which is what keeps the sheet one height
                  through the turn rather than snapping as it goes. */}
              <div className="detail-face is-front">
              <div className="detail-handle" />
              <div className="detail-head">
                <ItemThumb
                  thumb={selected.thumb}
                  title={selected.title}
                  image={selected.image}
                />
                <div>
                  {/* No ticket or bracelet mark here — the count matters when
                      you're scanning a list, not once you've opened the one. */}
                  <strong>{selected.title}</strong>
                  <span>{selected.subtitle}</span>
                  {/* The money sits with the title as a third line rather than
                      as its own paragraph above the button — same size as the
                      subtitle, so the head reads as one block of facts. */}
                  {pmOpen && selected.seller ? null : (
                    <span className="detail-pay">
                      {selected.seller
                        ? `${formatCost(selected)} to ${pmName(selected.seller)} · fixed price`
                        : selected.pricePbs <= balance
                          ? /* Price and what's left after it — the two things
                               you need before pressing Pay. The earn clause
                               used to sit between them on events only, which
                               pushed the line past the sheet and truncated it;
                               the gain is already on the row you tapped and on
                               the banner, so a third copy was costing the line
                               its legibility. */
                            `${formatCost(selected)} · ${formatPbs(balance - selected.pricePbs)} left`
                          : `This is ${formatPbs(selected.pricePbs - balance)} over your ${formatTokenBalance(balance)} pck.`}
                    </span>
                  )}
                </div>
                {/* Nothing in this corner. The price is on the pay line and on
                    the button right below it; a third copy was just noise. */}
              </div>
              {pmOpen && selected.seller ? (
                <>
                  {/* Built like the sell sheet: a labelled field rather than a
                      sentence of instructions, and the same two buttons in the
                      same voice underneath. */}
                  {pmSent ? (
                    <p>Sent to {pmName(selected.seller)}.</p>
                  ) : (
                    <label className="sell-field">
                      <span className="sell-field-row">
                        Message
                        <em className="sell-ratio">to {pmName(selected.seller)}</em>
                      </span>
                      <textarea
                        className="pm-draft"
                        rows={3}
                        placeholder={`About ${selected.title}`}
                        value={pmDraft}
                        autoFocus
                        onChange={(event) => setPmDraft(event.target.value)}
                      />
                    </label>
                  )}
                  {pmSent ? null : (
                    <button
                      type="button"
                      className="pay-btn"
                      disabled={!pmDraft.trim()}
                      onClick={() => setPmSent(true)}
                    >
                      Send
                    </button>
                  )}
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => {
                      setPmOpen(false)
                      setPmDraft('')
                      setPmSent(false)
                    }}
                  >
                    {/* This one steps back to the sheet it came from rather
                        than closing anything, so it says so. */}
                    Go Back
                  </button>
                </>
              ) : (
                <>
                  {/* The price is already in the head; the button only
                      has to say what pressing it does. */}
                  <button
                    type="button"
                    className="pay-btn"
                    onClick={() => setPaid(true)}
                    disabled={selected.pricePbs > balance}
                  >
                    Pay Now
                  </button>
                  {selected.seller ? (
                    <button type="button" className="ghost-btn" onClick={() => setPmOpen(true)}>
                      PM {pmName(selected.seller)}
                    </button>
                  ) : null}
                  <button type="button" className="ghost-btn" onClick={closeDetail}>
                    Cancel
                  </button>
                </>
              )}
              </div>
              <div
                className={`detail-face is-back${waits ? ' is-wait' : ''}`}
                aria-hidden={!paid}
              >
                <div className="detail-handle" />
                <p className="code-title">{selected.title}</p>
                {/* A deal that waits never shows anything else: the moment it
                    clears, the sheet closes and the wallet takes over. Only a
                    ticket issued by the app turns over to a code. */}
                {waits ? (
                  <div className="deal-wait">
                    <CrestLoader />
                    <span>
                      {selected.seller
                        ? `Waiting on ${pmName(selected.seller)} to accept`
                        : 'Clearing your payment'}
                    </span>
                  </div>
                ) : (
                <div className="code-plate">
                  <svg viewBox="0 0 236 68" aria-hidden="true">
                    {barsFor(selected.id).map((bar) => (
                      <rect
                        key={bar.x}
                        x={bar.x}
                        y="0"
                        width={bar.width}
                        height="68"
                        fill="#fff"
                      />
                    ))}
                  </svg>
                  <span>{codeFor(selected.id)}</span>
                </div>
                )}
                <button type="button" className="ghost-btn" onClick={closeDetail}>
                  Cancel
                </button>
              </div>
            </aside>
          ) : null}
        </RemixProvider>
      </div>
    </div>
  )
}
