import { useRef, useState } from 'react'
import { BottomNav } from './components/BottomNav.jsx'
import { ItemThumb } from './components/ItemRow.jsx'
import { EarnBadge } from './components/EarnBadge.jsx'
import { SellerFace } from './components/SellerFace.jsx'
import { Splash } from './components/Splash.jsx'
import wallet from './data/wallet.json'
import { formatCost, formatEarn, formatPbs, formatTokenBalance, earnAmount, isEventItem } from './lib/format.js'
import { rankVars } from './lib/settings.js'
import { unlockMotion, useWalletTilt } from './lib/tilt.js'
import { EventsScreen } from './screens/EventsScreen.jsx'
import { FeedScreen } from './screens/FeedScreen.jsx'
import { MarketplaceScreen } from './screens/MarketplaceScreen.jsx'
import { ShopScreen } from './screens/ShopScreen.jsx'
import { WalletScreen } from './screens/WalletScreen.jsx'
import './App.css'

export default function App() {
  const [booted, setBooted] = useState(false)
  const [tab, setTab] = useState('events')
  const [selected, setSelected] = useState(null)
  const phone = useRef(null)
  useWalletTilt(phone, booted)

  if (!booted) {
    return (
      <div className="stage">
        <div className="phone">
          <Splash
            onDone={async () => {
              await unlockMotion()
              setBooted(true)
            }}
          />
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
        style={rankVars(wallet.balance)}
      >
        {tab === 'events' ? <EventsScreen onSelect={setSelected} /> : null}
        {tab === 'shop' ? <ShopScreen onSelect={setSelected} /> : null}
        {tab === 'marketplace' ? (
          <MarketplaceScreen onSelect={setSelected} />
        ) : null}
        {tab === 'feed' ? <FeedScreen /> : null}
        {tab === 'wallet' ? <WalletScreen onSelect={setSelected} /> : null}
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
                <strong>{selected.title}</strong>
                <span>{selected.subtitle}</span>
              </div>
              {selected.seller ? (
                <SellerFace seller={selected.seller} size="detail" />
              ) : (
                <span className="item-price">
                  <span className="cost-mark">{formatCost(selected)}</span>
                  {isEventItem(selected) ? <EarnBadge item={selected} /> : null}
                </span>
              )}
            </div>
            <p>
              {selected.seller
                ? `Pay ${formatCost(selected)} to ${selected.seller.name}. Same price as the door — their profile is on the listing.`
                : selected.pricePbs <= wallet.balance
                  ? isEventItem(selected)
                    ? `Pay ${formatCost(selected)}. You gain ${formatEarn(earnAmount(selected))} p, with ${formatPbs(wallet.balance - selected.pricePbs)} left.`
                    : `Pay ${formatCost(selected)}. ${formatPbs(wallet.balance - selected.pricePbs)} left.`
                  : `This is ${formatPbs(selected.pricePbs - wallet.balance)} over your ${formatTokenBalance(wallet.balance)} pbs.`}
            </p>
            <button type="button" className="pay-btn">
              Pay {formatCost(selected)}
            </button>
            <button type="button" className="ghost-btn" onClick={() => setSelected(null)}>
              Close
            </button>
          </aside>
        ) : null}
      </div>
    </div>
  )
}
