import { useEffect, useRef, useState } from 'react'
import { BottomNav } from './components/BottomNav.jsx'
import { ItemThumb, TicketMark } from './components/ItemRow.jsx'
import { EarnBadge } from './components/EarnBadge.jsx'
import { SellerFace } from './components/SellerFace.jsx'
import { RemixProvider } from './components/RemixPlayer.jsx'
import { Splash } from './components/Splash.jsx'
import wallet from './data/wallet.json'
import { formatCost, formatEarn, formatPbs, formatTokenBalance, earnAmount, isEventItem } from './lib/format.js'
import { rankVars } from './lib/settings.js'
import { consumeLocationRedeem } from './lib/passes.js'
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
  useWalletTilt(phone, booted)

  useEffect(() => {
    setPmOpen(false)
    setPmDraft('')
    setPmSent(false)
  }, [selected?.id])

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
            <aside className="detail-sheet" role="dialog" aria-label={selected.title}>
              <div className="detail-handle" />
              <div className="detail-head">
                <ItemThumb
                  thumb={selected.thumb}
                  title={selected.title}
                  image={selected.image}
                />
                <div>
                  <strong>
                    {selected.title}
                    <TicketMark
                      count={selected.tickets}
                      kind={selected.filters?.includes('bracelets') ? 'bracelet' : 'ticket'}
                    />
                  </strong>
                  <span>{selected.subtitle}</span>
                </div>
                {selected.seller ? (
                  <SellerFace seller={selected.seller} size="detail" />
                ) : (
                  <span className="item-price">
                    <span className="cost-mark">{formatCost(selected)}</span>
                    {tab === 'events' && isEventItem(selected) ? (
                      <EarnBadge item={selected} />
                    ) : null}
                  </span>
                )}
              </div>
              {pmOpen && selected.seller ? (
                <>
                  <p>
                    {pmSent
                      ? `Sent to ${pmName(selected.seller)}.`
                      : `Message ${pmName(selected.seller)} about ${selected.title}.`}
                  </p>
                  {pmSent ? null : (
                    <textarea
                      className="pm-draft"
                      rows={3}
                      placeholder={`Message ${pmName(selected.seller)}`}
                      value={pmDraft}
                      autoFocus
                      onChange={(event) => setPmDraft(event.target.value)}
                    />
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
                    Back
                  </button>
                </>
              ) : (
                <>
                  <p>
                    {selected.seller
                      ? `Pay ${formatCost(selected)} to ${selected.seller.name}. Fixed price — their profile is on the listing.`
                      : selected.pricePbs <= wallet.balance
                        ? isEventItem(selected)
                          ? `Pay ${formatCost(selected)}. You gain ${formatEarn(earnAmount(selected))} pbs, with ${formatPbs(wallet.balance - selected.pricePbs)} left.`
                          : `Pay ${formatCost(selected)}. ${formatPbs(wallet.balance - selected.pricePbs)} left.`
                        : `This is ${formatPbs(selected.pricePbs - wallet.balance)} over your ${formatTokenBalance(wallet.balance)} pbs.`}
                  </p>
                  <button type="button" className="pay-btn">
                    Pay {formatCost(selected)}
                  </button>
                  {selected.seller ? (
                    <button type="button" className="ghost-btn" onClick={() => setPmOpen(true)}>
                      PM {pmName(selected.seller)}
                    </button>
                  ) : null}
                  <button type="button" className="ghost-btn" onClick={closeDetail}>
                    Close
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
