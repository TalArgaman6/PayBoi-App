import { useEffect, useMemo, useState } from 'react'
import wallet from '../data/wallet.json'
import { FilterTabs } from '../components/FilterTabs.jsx'
import { ItemRow } from '../components/ItemRow.jsx'
import { RiderRow } from '../components/RiderRow.jsx'
import { ScreenHeader } from '../components/ScreenHeader.jsx'
import { WalletCard } from '../components/WalletCard.jsx'
import { PRICE_RANGES, inPriceRange } from '../lib/filters.js'
import { assetUrl, formatPbs } from '../lib/format.js'
import { passCounts, watchPasses } from '../lib/passes.js'
import { kindLabel, suggestionsForBalance } from '../lib/suggestions.js'

const SUGGESTION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'event', label: 'Events' },
  { id: 'shop', label: 'Drop' },
]

/*
 * Backdrops to choose between. Tapping the pboi mark in the header steps
 * through them — a testing affordance while we settle on one, not a setting.
 */
const CRYSTALS = [
  // Down to the two drawn plumes in the app's own blues. The photographic
  // ones — noir, ivory, dusk, gold, iridescent — are all out.
  'photos/wallet-plume-royal.jpg',
  'photos/wallet-plume-teal.jpg',
]

/*
 * The screen unmounts when you leave the tab, so the choice has to live
 * outside the component or every trip to the feed would reset it. A module
 * variable is enough — it should survive moving around the app, not a reload.
 */
let lastSkin = 0

export function WalletScreen({ onSelect, openedPass = null }) {
  const [skin, setSkinState] = useState(lastSkin)

  function setSkin(next) {
    lastSkin = next
    setSkinState(next)
  }
  const [kind, setKind] = useState('all')
  const [price, setPrice] = useState('all')
  const [openGift, setOpenGift] = useState(openedPass)
  const [passTick, setPassTick] = useState(0)
  const [hoverGift, setHoverGift] = useState(null)
  const [selectedGift, setSelectedGift] = useState(null)
  const litGift = hoverGift || selectedGift || openGift
  const counts = useMemo(() => passCounts(wallet.gifts), [passTick])

  useEffect(() => watchPasses(() => setPassTick((tick) => tick + 1)), [])
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
    <section
      className={`screen wallet-screen${
        /* A pale backdrop flips the header, the balance and the crest to ink,
           or they disappear into the feathers. Nothing in the set is pale at
           the moment — the ivory plume is gone — but the switch stays, and the
           `is-light` rules with it, for whenever a light one comes back. */
        CRYSTALS[skin].includes('ivory') ? ' is-light' : ''
      }`}
    >
      {/* A shot of cut glass behind the whole screen. It fades to black down
          the bottom where the sheet sits, so the colour reads as a glow above
          the card rather than as noise under the lists. */}
      <div
        className="wallet-crystal"
        style={{ backgroundImage: `url("${assetUrl(CRYSTALS[skin])}")` }}
        aria-hidden="true"
      />
      <div className="wallet-top">
        <ScreenHeader
          title={wallet.name}
          onLogo={() => setSkin((skin + 1) % CRYSTALS.length)}
        />
        <div className="wallet-hero">
          <WalletCard wallet={wallet} />
          <div className="wallet-profile" aria-hidden="true">
            <img src={assetUrl(wallet.photo)} alt="" />
          </div>
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
                count={counts[gift.id]}
                open={openGift === gift.id}
                lit={litGift === gift.id}
                onHover={setHoverGift}
                onToggle={() => {
                  setOpenGift((current) => {
                    const next = current === gift.id ? null : gift.id
                    setSelectedGift(next)
                    return next
                  })
                }}
                onGranted={() => {
                  setOpenGift(null)
                  setSelectedGift(null)
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
