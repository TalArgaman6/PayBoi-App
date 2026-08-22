import { useMemo, useState } from 'react'
import wallet from '../data/wallet.json'
import { FilterTabs } from '../components/FilterTabs.jsx'
import { ItemRow } from '../components/ItemRow.jsx'
import { RiderRow } from '../components/RiderRow.jsx'
import { ScreenHeader } from '../components/ScreenHeader.jsx'
import { WalletCard } from '../components/WalletCard.jsx'
import { PRICE_RANGES, inPriceRange } from '../lib/filters.js'
import { assetUrl, formatPbs } from '../lib/format.js'
import { kindLabel, suggestionsForBalance } from '../lib/suggestions.js'

const totalWorth = wallet.gifts.reduce(
  (sum, gift) => sum + (gift.worth ?? gift.count),
  0,
)

const WALLET_STARS = [
  { id: 1, top: '9%', left: '16%', size: 5, delay: '0s', duration: '3.2s' },
  { id: 2, top: '12%', left: '48%', size: 4, delay: '1.1s', duration: '3.8s' },
  { id: 3, top: '8%', left: '78%', size: 6, delay: '0.5s', duration: '3.4s' },
  { id: 4, top: '24%', left: '28%', size: 5, delay: '1.8s', duration: '4s' },
  { id: 5, top: '22%', left: '64%', size: 4, delay: '0.8s', duration: '3.1s' },
  { id: 6, top: '34%', left: '12%', size: 5, delay: '2.2s', duration: '3.6s' },
  { id: 7, top: '36%', left: '52%', size: 6, delay: '1.4s', duration: '4.2s' },
  { id: 8, top: '30%', left: '88%', size: 4, delay: '0.3s', duration: '3.5s' },
  { id: 9, top: '18%', left: '91%', size: 5, delay: '2.6s', duration: '3.9s' },
]

const SUGGESTION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'event', label: 'Events' },
  { id: 'shop', label: 'Drop' },
]

export function WalletScreen({ onSelect }) {
  const [kind, setKind] = useState('all')
  const [price, setPrice] = useState('all')
  const [openGift, setOpenGift] = useState(null)
  const [hoverGift, setHoverGift] = useState(null)
  const [selectedGift, setSelectedGift] = useState(null)
  const litGift = hoverGift || selectedGift || openGift
  const curated = useMemo(
    () => suggestionsForBalance(wallet.balance),
    [],
  )
  const affordable = useMemo(
    () => suggestionsForBalance(wallet.balance, { diverse: false }),
    [],
  )
  const source = kind === 'all' && price === 'all' ? curated : affordable
  const visible = source.filter(
    (item) =>
      (kind === 'all' || item.kind === kind) && inPriceRange(item, price),
  )

  return (
    <section className="screen wallet-screen">
      <div className="wallet-glitter" aria-hidden="true" />
      <div className="wallet-stars" aria-hidden="true">
        {WALLET_STARS.map((star) => (
          <i
            key={star.id}
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>
      <div className="wallet-shine" aria-hidden="true" />
      <ScreenHeader
        title="Wallet"
        kicker={wallet.nickname}
      />
      <div className="wallet-hero">
        <WalletCard wallet={wallet} />
        <div className="wallet-profile" aria-hidden="true">
          <img src={assetUrl(wallet.photo)} alt="" />
        </div>
      </div>
      <div className="sheet wallet-sheet">
        <p className="coin-caption">{wallet.caption}</p>
        <div className="gift-room">
          <ul>
            {wallet.gifts.map((gift) => (
              <RiderRow
                key={gift.id}
                gift={gift}
                share={Math.round(((gift.worth ?? gift.count) / totalWorth) * 100)}
                open={openGift === gift.id}
                lit={litGift === gift.id}
                onHover={setHoverGift}
                onLight={(id) =>
                  setSelectedGift((current) => (current === id ? null : id))
                }
                onToggle={() => {
                  setOpenGift((current) => {
                    const next = current === gift.id ? null : gift.id
                    setSelectedGift(next)
                    return next
                  })
                }}
              />
            ))}
          </ul>
        </div>
        <div className="spend-now">
          <p className="gift-kicker">You can buy now</p>
          <FilterTabs
            filters={SUGGESTION_FILTERS}
            active={kind}
            onChange={setKind}
          />
          <FilterTabs
            size="sm"
            filters={PRICE_RANGES}
            active={price}
            onChange={setPrice}
          />
          <div className="item-list">
            {visible.map((item) => (
              <ItemRow
                key={`${item.kind}-${item.id}`}
                item={item}
                meta={`${kindLabel(item.kind)} · ${formatPbs(item.leftover)} left`}
                onSelect={onSelect}
              />
            ))}
            {visible.length === 0 ? (
              <p className="empty">Nothing in this spend range with your stack.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
