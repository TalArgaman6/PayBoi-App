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
  eventCurrency,
  formatLocal,
  inPbsSpan,
  isFullPriceSpan,
} from '../lib/filters.js'
import { formatPbs, formatWhen, matchesQuery } from '../lib/format.js'

function formatFilterPrice(pbs, country) {
  const local = formatLocal(pbs, currencyForCountry(country))
  return `${formatPbs(pbs)} · ${local}`
}

export function EventsScreen({ onSelect }) {
  const [query, setQuery] = useState('')
  const [menu, setMenu] = useState(false)
  const [type, setType] = useState('all')
  const [ride, setRide] = useState('all')
  const [priceMin, setPriceMin] = useState(PRICE_SLIDER.min)
  const [priceMax, setPriceMax] = useState(PRICE_SLIDER.max)

  const country = DEFAULT_COUNTRY
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
        const rideOk = ride === 'all' || Boolean(item.rides)
        return (
          nearby(item) &&
          typeOk &&
          rideOk &&
          inPbsSpan(item, priceMin, priceMax) &&
          matchesQuery(item, query)
        )
      }),
    [country, priceMax, priceMin, query, ride, type],
  )

  const place =
    catalog.countries.find((item) => item.id === country)?.label || catalog.city

  const typeLabel =
    catalog.types.find((item) => item.id === type)?.label || 'All'
  const rideOn = ride !== 'all'
  const activeCount = [type !== 'all', rideOn, priceOpen].filter(Boolean).length

  function resetFilters() {
    setType('all')
    setRide('all')
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
          <button
            type="button"
            className="filter-launch"
            onClick={() => setMenu(true)}
          >
            Filter
            {activeCount ? <i>{activeCount}</i> : null}
          </button>
        </div>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search events, DJs, rooms"
        />
        {activeCount ? (
          <div className="active-filters">
            {type !== 'all' ? <span>{typeLabel}</span> : null}
            {rideOn ? <span>Shared ride</span> : null}
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
              meta={`${formatWhen(item.date, item.time)} · ${item.venue} · ${formatLocal(item.pricePbs, eventCurrency(item))}`}
              onSelect={onSelect}
            />
          ))}
          {items.length === 0 ? (
            <p className="empty">Nothing in this type, ride, or price range yet.</p>
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
          label="Shared ride"
          filters={[
            { id: 'all', label: 'All' },
            { id: 'area', label: 'From your area' },
          ]}
          active={ride}
          onChange={setRide}
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
