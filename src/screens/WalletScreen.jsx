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
  { id: 1, top: '8%', left: '14%', size: 7, delay: '0s', duration: '2.4s' },
  { id: 2, top: '11%', left: '38%', size: 5, delay: '0.6s', duration: '3.1s' },
  { id: 3, top: '7%', left: '62%', size: 8, delay: '1.2s', duration: '2.7s' },
  { id: 4, top: '13%', left: '84%', size: 6, delay: '0.3s', duration: '3.4s' },
  { id: 5, top: '22%', left: '8%', size: 5, delay: '1.8s', duration: '2.9s' },
  { id: 6, top: '18%', left: '27%', size: 9, delay: '0.9s', duration: '2.2s' },
  { id: 7, top: '26%', left: '49%', size: 6, delay: '1.5s', duration: '3.6s' },
  { id: 8, top: '20%', left: '71%', size: 7, delay: '0.2s', duration: '2.5s' },
  { id: 9, top: '16%', left: '93%', size: 5, delay: '2.1s', duration: '3s' },
  { id: 10, top: '32%', left: '18%', size: 6, delay: '1.1s', duration: '2.8s' },
  { id: 11, top: '30%', left: '41%', size: 8, delay: '0.4s', duration: '3.3s' },
  { id: 12, top: '34%', left: '66%', size: 5, delay: '1.7s', duration: '2.3s' },
  { id: 13, top: '28%', left: '88%', size: 7, delay: '0.8s', duration: '3.2s' },
  { id: 14, top: '40%', left: '11%', size: 5, delay: '2.4s', duration: '2.6s' },
  { id: 15, top: '38%', left: '33%', size: 6, delay: '1.3s', duration: '3.5s' },
  { id: 16, top: '42%', left: '55%', size: 8, delay: '0.5s', duration: '2.1s' },
  { id: 17, top: '36%', left: '78%', size: 5, delay: '1.9s', duration: '2.9s' },
  { id: 18, top: '9%', left: '51%', size: 4, delay: '2.6s', duration: '3.8s' },
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
