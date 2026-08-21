import { useMemo, useState } from 'react'
import catalog from '../data/events.json'
import { FeaturedBanner } from '../components/FeaturedBanner.jsx'
import { FilterDrawer } from '../components/FilterDrawer.jsx'
import { FilterTabs } from '../components/FilterTabs.jsx'
import { ItemRow } from '../components/ItemRow.jsx'
import { PriceRangeBar } from '../components/PriceRangeBar.jsx'
import { ScreenHeader } from '../components/ScreenHeader.jsx'
import { SearchBar } from '../components/SearchBar.jsx'
import {
  DEFAULT_COUNTRY,
  PRICE_SLIDER,
  currencyForCountry,
  currencyLabel,
  inPbsSpan,
  isFullPriceSpan,
} from '../lib/filters.js'
import { formatWhen, matchesQuery } from '../lib/format.js'

function formatFilterPrice(pbs) {
  return `₪${Math.round(pbs * 0.375)} / ${pbs} pbs`
}

export function EventsScreen({ onSelect, country = DEFAULT_COUNTRY }) {
  const [query, setQuery] = useState('')
  const [menu, setMenu] = useState(false)
  const [type, setType] = useState('all')
  const [line, setLine] = useState('all')
  const [ride, setRide] = useState('all')
  const [together, setTogether] = useState('all')
  const [bracelet, setBracelet] = useState('all')
  const [priceMin, setPriceMin] = useState(PRICE_SLIDER.min)
  const [priceMax, setPriceMax] = useState(PRICE_SLIDER.max)

  const currency = currencyForCountry(country)
  const priceOpen = !isFullPriceSpan(priceMin, priceMax)
  const nearby = (item) =>
    item.country === country || item.type === 'travel'

  const featured = useMemo(
    () => catalog.items.filter((item) => item.featured && nearby(item)),
    [country],
  )

  const items = useMemo(
    () =>
      catalog.items.filter((item) => {
        const typeOk = type === 'all' || item.type === type
        const lineOk = line === 'all' || item.line === line
        const rideOk = ride === 'all' || Boolean(item.rides)
        const togetherOk = together === 'all' || Boolean(item.together)
        const braceletOk = bracelet === 'all' || Boolean(item.bracelet)
        return (
          nearby(item) &&
          typeOk &&
          lineOk &&
          rideOk &&
          togetherOk &&
          braceletOk &&
          inPbsSpan(item, priceMin, priceMax) &&
          matchesQuery(item, query)
        )
      }),
    [
      bracelet,
      country,
      line,
      priceMax,
      priceMin,
      query,
      ride,
      together,
      type,
    ],
  )

  const place =
    catalog.countries.find((item) => item.id === country)?.label || catalog.city

  const typeLabel =
    catalog.types.find((item) => item.id === type)?.label || 'All'
  const lineLabel =
    catalog.lines.find((item) => item.id === line)?.label || 'All'
  const rideOn = ride !== 'all'
  const togetherOn = together !== 'all'
  const braceletOn = bracelet !== 'all'
  const activeCount = [
    type !== 'all',
    line !== 'all',
    rideOn,
    togetherOn,
    braceletOn,
    priceOpen,
  ].filter(Boolean).length

  function resetFilters() {
    setType('all')
    setLine('all')
    setRide('all')
    setTogether('all')
    setBracelet('all')
    setPriceMin(PRICE_SLIDER.min)
    setPriceMax(PRICE_SLIDER.max)
  }

  return (
    <section className="screen screen-events">
      <ScreenHeader title="Events" kicker={place} />
      <div className="sheet">
        <FeaturedBanner items={featured} onSelect={onSelect} />
        <div className="list-toolbar">
          <p className="count-line">
            {items.length} events · {place}
          </p>
          <div className="filter-tools">
            <button
              type="button"
              className="filter-reset"
              onClick={resetFilters}
              aria-label="Reset filters"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 3v5h5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="filter-launch"
              onClick={() => setMenu(true)}
            >
              Filter
              {activeCount ? <i>{activeCount}</i> : null}
            </button>
          </div>
        </div>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search events, DJs, rooms"
        />
        {activeCount ? (
          <div className="active-filters">
            {type !== 'all' ? <span>{typeLabel}</span> : null}
            {line !== 'all' ? <span>{lineLabel}</span> : null}
            {rideOn ? <span>Shared ride</span> : null}
            {togetherOn ? <span>Party together</span> : null}
            {braceletOn ? <span>Bracelet</span> : null}
            {priceOpen ? (
              <span>
                {formatFilterPrice(priceMin, country)} –{' '}
                {formatFilterPrice(priceMax, country)}
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="item-list">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              meta={`${formatWhen(item.date, item.time)} · ${item.venue}`}
              showEarn
              onSelect={onSelect}
            />
          ))}
          {items.length === 0 ? (
            <p className="empty">Nothing in this mix yet.</p>
          ) : null}
        </div>
      </div>
      <FilterDrawer
        open={menu}
        onClose={() => setMenu(false)}
        onClear={resetFilters}
      >
        <div className="filter-row">
          <p className="filter-label">Currency</p>
          <p className="currency-lock">{currencyLabel(currency)}</p>
        </div>
        <FilterTabs
          label="Type"
          filters={catalog.types}
          active={type}
          onChange={setType}
        />
        <FilterTabs
          label="Party line"
          filters={catalog.lines}
          active={line}
          onChange={setLine}
        />
        <FilterTabs
          label="Shared ride"
          filters={[
            { id: 'all', label: 'All' },
            { id: 'area', label: 'From your area' },
          ]}
          active={ride}
          onChange={setRide}
        />
        <FilterTabs
          label="Party together"
          note="Up to 5 tickets"
          filters={[
            { id: 'all', label: 'All' },
            { id: 'group', label: 'Together' },
          ]}
          active={together}
          onChange={setTogether}
        />
        <FilterTabs
          label="Bracelet"
          filters={[
            { id: 'all', label: 'All' },
            { id: 'pass', label: 'Line pass' },
          ]}
          active={bracelet}
          onChange={setBracelet}
        />
        <PriceRangeBar
          min={priceMin}
          max={priceMax}
          onChange={(nextMin, nextMax) => {
            setPriceMin(nextMin)
            setPriceMax(nextMax)
          }}
          formatValue={(value) => formatFilterPrice(value, country)}
        />
      </FilterDrawer>
    </section>
  )
}
