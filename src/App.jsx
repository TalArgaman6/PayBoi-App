import { useState } from 'react'
import { BottomNav } from './components/BottomNav.jsx'
import { ItemThumb } from './components/ItemRow.jsx'
import { EarnBadge } from './components/EarnBadge.jsx'
import { Splash } from './components/Splash.jsx'
import wallet from './data/wallet.json'
import { formatPbs, formatTokenBalance } from './lib/format.js'
import { EventsScreen } from './screens/EventsScreen.jsx'
import { MarketplaceScreen } from './screens/MarketplaceScreen.jsx'
import { ShopScreen } from './screens/ShopScreen.jsx'
import { WalletScreen } from './screens/WalletScreen.jsx'
import './App.css'

export default function App() {
  const [booted, setBooted] = useState(false)
  const [tab, setTab] = useState('events')
  const [selected, setSelected] = useState(null)

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
      <div className="phone">
        {tab === 'events' ? <EventsScreen onSelect={setSelected} /> : null}
        {tab === 'shop' ? <ShopScreen onSelect={setSelected} /> : null}
        {tab === 'marketplace' ? (
          <MarketplaceScreen onSelect={setSelected} />
        ) : null}
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
              <EarnBadge item={selected} />
            </div>
            <p>
              {selected.pricePbs <= wallet.balance
                ? `Pay ${formatPbs(selected.pricePbs)}. You gain ${selected.earnPbs ?? selected.pricePbs} pts, with ${formatPbs(wallet.balance - selected.pricePbs)} left.`
                : `This is ${formatPbs(selected.pricePbs - wallet.balance)} over your ${formatTokenBalance(wallet.balance)} pbs.`}
            </p>
            <button type="button" className="pay-btn">
              Pay {formatPbs(selected.pricePbs)}
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
