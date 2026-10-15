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
import { useBalance } from '../lib/balance.js'

const SUGGESTION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'event', label: 'Events' },
  { id: 'shop', label: 'Drop' },
]

/*
 * Backdrops, earned. The four grounds are a ladder rather than a palette: the
 * ink plume is where everyone starts, and the balance on the card decides
 * which one is behind it. Nothing announces the change — the screen is simply
 * richer the next time it comes up, which is the point of a card that shows
 * what you are worth.
 */
const CRYSTALS = [
  // The same drawn plume in four grounds: the app's blues outlined in ink and
  // in silver, then black and bone. The three that carried the gold line are
  // gone.
  'photos/wallet-plume-ink.jpg',
  'photos/wallet-plume-silver.jpg',
  'photos/wallet-plume-jet.jpg',
  'photos/wallet-plume-chalk.jpg',
  // The top of the ladder: the plume in gold, which nothing but a five-figure
  // balance reaches.
  'photos/wallet-plume-gold.jpg',
]

/*
 * Which of the four is up, as a word the stylesheet can read. Two of them —
 * the silver-outlined blue and the bone — are pale where the furniture sits,
 * so the header goes ink on those; see `.wallet-screen[data-skin]` in App.css.
 */
const SKIN_NAMES = ['ink', 'silver', 'jet', 'chalk', 'gold']

/*
 * Where each ground starts, read from the top down so the richest threshold a
 * balance clears is the one that takes it.
 */
const SKIN_STEPS = [
  { from: 10000, skin: 4 },
  { from: 8000, skin: 3 },
  { from: 5000, skin: 2 },
  { from: 2000, skin: 1 },
]

/*
 * All five are on the ladder now: the silver-outlined blue was the one left
 * over, and it is the first thing a balance earns — close enough to the ink
 * it starts on that the change reads as the same card getting richer rather
 * than a different card. Tapping the name or the mark still steps through all
 * five by hand, and the balance takes the screen back the moment the figure
 * moves.
 */

function skinForBalance(balance) {
  const step = SKIN_STEPS.find((entry) => balance > entry.from)
  return step ? step.skin : 0
}

export function WalletScreen({ onSelect, openedPass = null }) {
  // Live, so a deal that lands while the card is up carries the backdrop with
  // it rather than waiting for the next visit.
  const balance = useBalance()
  const earned = skinForBalance(balance)
  // null while the balance is in charge, which is all of the time until
  // someone taps the header to look at the others.
  const [picked, setPicked] = useState(null)
  const skin = picked === null ? earned : picked

  function step(by) {
    setPicked((skin + by + CRYSTALS.length) % CRYSTALS.length)
  }

  // A deal resets the screen to the ground it has actually earned.
  useEffect(() => setPicked(null), [earned])
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

  /*
   * Everything over the plume stays white, whatever the plume. The pale
   * grounds used to flip the header, the balance and the crest to ink; one
   * set of furniture across all five backdrops reads as the app rather than
   * as two themes.
   */
  return (
    <section className="screen wallet-screen" data-skin={SKIN_NAMES[skin]}>
      {/* A shot of cut glass behind the whole screen. It fades to black down
          the bottom where the sheet sits, so the colour reads as a glow above
          the card rather than as noise under the lists. */}
      <div
        className="wallet-crystal"
        style={{ backgroundImage: `url("${assetUrl(CRYSTALS[skin])}")` }}
        aria-hidden="true"
      />
      <div className="wallet-top">
        {/* The balance picks the ground; the name and the mark still step
            through all five by hand, the spare one included, so any of them
            can be put up for a look. */}
        <ScreenHeader
          title={wallet.name}
          onTitle={() => step(-1)}
          onLogo={() => step(1)}
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
