import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BottomNav } from './components/BottomNav.jsx'
import { ItemThumb } from './components/ItemRow.jsx'
import { RemixProvider } from './components/RemixPlayer.jsx'
import { Splash } from './components/Splash.jsx'
import wallet from './data/wallet.json'
import { formatCost, formatEarn, formatPbs, formatTokenBalance, earnAmount, isEventItem } from './lib/format.js'
import { rankVars } from './lib/settings.js'
import { consumeLocationRedeem } from './lib/passes.js'
import { useDismissOnOutside } from './lib/dismiss.js'
import { useWalletTilt } from './lib/tilt.js'
import { EventsScreen } from './screens/EventsScreen.jsx'
import { FeedScreen } from './screens/FeedScreen.jsx'
import { MarketplaceScreen } from './screens/MarketplaceScreen.jsx'
import { ShopScreen } from './screens/ShopScreen.jsx'
import { WalletScreen } from './screens/WalletScreen.jsx'
import './App.css'

const redeemedPassId = consumeLocationRedeem(wallet.gifts)

function pmName(seller) {
  const first = String(seller?.name || '').trim().split(/\s+/)[0]
  if (!first) return ''
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

export default function App() {
  const [booted, setBooted] = useState(Boolean(redeemedPassId))
  const [tab, setTab] = useState(redeemedPassId ? 'wallet' : 'feed')
  const [selected, setSelected] = useState(null)
  const [pmOpen, setPmOpen] = useState(false)
  const [pmDraft, setPmDraft] = useState('')
  const [pmSent, setPmSent] = useState(false)
  const phone = useRef(null)
  const detail = useRef(null)
  // Where the press that opened the sheet landed, in phone coordinates.
  const anchor = useRef(null)
  const [sheetTop, setSheetTop] = useState(null)
  useWalletTilt(phone, booted)
  useDismissOnOutside(detail, Boolean(selected), closeDetail)

  useEffect(() => {
    setPmOpen(false)
    setPmDraft('')
    setPmSent(false)
  }, [selected?.id])

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
      setSheetTop(null)
      return
    }

    const node = detail.current
    const frame = phone.current
    const from = anchor.current
    if (!node || !frame || !from) {
      setSheetTop(null)
      return
    }

    const height = node.offsetHeight
    const limit = frame.clientHeight
    const GAP = 10
    const TOP_EDGE = 12
    // Clear of the tab bar at the bottom.
    const BOTTOM_EDGE = 84

    let top = from.bottom + GAP
    if (top + height > limit - BOTTOM_EDGE) {
      // No room below: try above the row before falling back to pinned.
      top = Math.min(from.top - GAP - height, limit - BOTTOM_EDGE - height)
    }
    setSheetTop(Math.max(TOP_EDGE, top))
  }, [selected?.id, pmOpen, pmSent])

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
        style={rankVars(wallet.balance, { premium: wallet.premium })}
      >
        <RemixProvider>
          {tab === 'events' ? <EventsScreen onSelect={setSelected} /> : null}
          {tab === 'shop' ? <ShopScreen onSelect={setSelected} /> : null}
          {tab === 'marketplace' ? (
            <MarketplaceScreen onSelect={setSelected} />
          ) : null}
          {tab === 'feed' ? <FeedScreen /> : null}
          {tab === 'wallet' ? (
            <WalletScreen onSelect={setSelected} openedPass={redeemedPassId} />
          ) : null}
          <BottomNav tab={tab} onChange={setTab} />
          {selected ? (
            <aside
              ref={detail}
              className="detail-sheet"
              role="dialog"
              aria-label={selected.title}
              style={
                sheetTop === null
                  ? undefined
                  : { top: `${sheetTop}px`, bottom: 'auto' }
              }
            >
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
                        : selected.pricePbs <= wallet.balance
                          ? isEventItem(selected)
                            ? `${formatCost(selected)} · earn ${formatEarn(earnAmount(selected))} · ${formatPbs(wallet.balance - selected.pricePbs)} left`
                            : `${formatCost(selected)} · ${formatPbs(wallet.balance - selected.pricePbs)} left`
                          : `This is ${formatPbs(selected.pricePbs - wallet.balance)} over your ${formatTokenBalance(wallet.balance)} pbs.`}
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
                      SEND
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
                    GO BACK
                  </button>
                </>
              ) : (
                <>
                  {/* The price is already in the head; the button only
                      has to say what pressing it does. */}
                  <button type="button" className="pay-btn">
                    PAY NOW
                  </button>
                  {selected.seller ? (
                    <button type="button" className="ghost-btn" onClick={() => setPmOpen(true)}>
                      PM {pmName(selected.seller)}
                    </button>
                  ) : null}
                  <button type="button" className="ghost-btn" onClick={closeDetail}>
                    GO BACK
                  </button>
                </>
              )}
            </aside>
          ) : null}
        </RemixProvider>
      </div>
    </div>
  )
}
