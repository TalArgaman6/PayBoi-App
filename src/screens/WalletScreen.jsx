import { useEffect, useMemo, useRef, useState } from 'react'
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

/*
 * Where the feathers are. The five grounds are the same drawn plume in
 * different metals — the same fan, the same eyes, feather for feather — so a
 * single set of positions read off the picture serves all of them. Each entry
 * is the centre of one feather's eye in percentages of the backdrop, the
 * radius of the soft disc that covers that feather and its stem, and when in
 * the change it takes its new colour and how long it takes doing it. The
 * times are deliberately uneven: feathers that lit together read as a wipe.
 */
const FEATHERS = [
  { x: 36, y: 9, r: 15, at: 0, over: 760 },
  { x: 57, y: 6, r: 14, at: 180, over: 900 },
  { x: 19, y: 13, r: 14, at: 420, over: 700 },
  { x: 75, y: 12, r: 15, at: 260, over: 980 },
  { x: 45, y: 19, r: 13, at: 620, over: 820 },
  { x: 65, y: 21, r: 14, at: 500, over: 740 },
  { x: 10, y: 25, r: 13, at: 840, over: 900 },
  { x: 86, y: 24, r: 14, at: 700, over: 860 },
  { x: 53, y: 30, r: 15, at: 980, over: 820 },
  { x: 28, y: 31, r: 14, at: 1140, over: 760 },
  { x: 72, y: 34, r: 14, at: 1060, over: 940 },
  { x: 15, y: 40, r: 14, at: 1320, over: 880 },
  { x: 44, y: 42, r: 14, at: 1260, over: 800 },
  { x: 62, y: 45, r: 14, at: 1440, over: 900 },
  { x: 30, y: 49, r: 15, at: 1560, over: 860 },
  /* And the ground itself — everything between and behind the feathers, last
     and slowest, so the fan has finished turning before the air around it
     catches up. */
  { x: 50, y: 34, r: 120, at: 1700, over: 1100 },
]

function skinForBalance(balance) {
  const step = SKIN_STEPS.find((entry) => balance > entry.from)
  return step ? step.skin : 0
}

/*
 * The grounds, fetched the moment the card is first up. A ladder is only
 * convincing if the next rung is already there when the balance reaches it —
 * and the feather turn mounts sixteen copies of the arriving ground at once,
 * which is sixteen blank discs if the browser is still downloading it. One
 * pass at mount puts all five in cache and the change costs nothing after.
 */
let fetched = false

function preloadCrystals() {
  if (fetched || typeof window === 'undefined') return
  fetched = true
  for (const path of CRYSTALS) {
    const image = new window.Image()
    image.decoding = 'async'
    image.src = assetUrl(path)
  }
}

export function WalletScreen({ onSelect, openedPass = null }) {
  useEffect(preloadCrystals, [])
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
  /*
   * How a ground gives way to the next. The five are the same drawn plume in
   * different metals, feather for feather, so the honest way to change one
   * into another is not to dissolve the whole picture but to let the new
   * metal run round the fan — the outgoing ground stays underneath and the
   * incoming one is revealed by a soft wedge sweeping from the plume's own
   * centre, which lands feather by feather because that is how the feathers
   * are arranged. Each sits under the wedge's leading edge for a different
   * stretch of the sweep, so they take their colour at their own moment.
   */
  const [under, setUnder] = useState(null)
  const [sweep, setSweep] = useState(0)
  const was = useRef(skin)

  useEffect(() => {
    if (was.current === skin) return undefined
    setUnder(was.current)
    setSweep((turn) => turn + 1)
    was.current = skin
    const timer = window.setTimeout(() => setUnder(null), 3000)
    return () => window.clearTimeout(timer)
  }, [skin])

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
      {under === null ? (
        <div
          className="wallet-crystal"
          style={{ backgroundImage: `url("${assetUrl(CRYSTALS[skin])}")` }}
          aria-hidden="true"
        />
      ) : (
        /* Every layer of a turn in one group — the group is what carries the
           dimming, so the stack cannot compound. See `.wallet-turn`. */
        <div className="wallet-turn" aria-hidden="true">
        <div
          className="wallet-crystal"
          style={{ backgroundImage: `url("${assetUrl(CRYSTALS[under])}")` }}
          aria-hidden="true"
        />
        {/* One copy of the arriving ground per feather, each showing only its
            own feather and each coming up on its own clock. */}
        {FEATHERS.map((feather, index) => (
          <div
            key={`${sweep}-${index}`}
            className="wallet-crystal is-feather"
            style={{
              backgroundImage: `url("${assetUrl(CRYSTALS[skin])}")`,
              '--feather-x': `${feather.x}%`,
              '--feather-y': `${feather.y}%`,
              '--feather-r': `${feather.r}%`,
              animationDelay: `${feather.at}ms`,
              animationDuration: `${feather.over}ms`,
            }}
            aria-hidden="true"
          />
        ))}
        </div>
      )}
      <div className="wallet-top">
        {/* The balance picks the ground; the name and the mark still step
            through all five by hand, the spare one included, so any of them
            can be put up for a look. */}
        <ScreenHeader
          title={wallet.name}
          onTitle={() => step(1)}
          onLogo={() => step(-1)}
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
