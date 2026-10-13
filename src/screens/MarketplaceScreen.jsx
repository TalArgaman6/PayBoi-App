import { useMemo, useState } from 'react'
import catalog from '../data/marketplace.json'
import products from '../data/products.json'
import events from '../data/events.json'
import wallet from '../data/wallet.json'
import { FeaturedBanner } from '../components/FeaturedBanner.jsx'
import { FilterTabs } from '../components/FilterTabs.jsx'
import { ItemRow } from '../components/ItemRow.jsx'
import { ScreenHeader } from '../components/ScreenHeader.jsx'
import { SearchBar } from '../components/SearchBar.jsx'
import { SellTicketSheet } from '../components/SellTicketSheet.jsx'
import {
  formatCost,
  formatWhenVenue,
  listingTitle,
  matchesQuery,
} from '../lib/format.js'

const ME = {
  name: wallet.nickname,
  photo: wallet.photo,
}

const MARKET_FILTERS = [{ id: 'drop', label: 'Drop' }, ...catalog.filters]

const EVENTS = Object.fromEntries(events.items.map((item) => [item.id, item]))

// The two priciest products in the Drop aisle ride at the top on their own
// plates, the way the headline events do on the Events list. Derived from the
// catalog rather than written down, so adding a bigger drop promotes itself.
const TOP_DROPS = [...products.items]
  .sort((a, b) => (b.pricePbs || 0) - (a.pricePbs || 0))
  .slice(0, 2)
  .map((item) => item.id)

function dropRank(item) {
  const at = TOP_DROPS.indexOf(item.id)
  return at === -1 ? TOP_DROPS.length : at
}

function listingItem(item) {
  const event = EVENTS[item.eventId]
  const dated = {
    ...item,
    date: item.date || event?.date,
    time: item.time || event?.time,
    venue: item.venue || event?.venue,
  }

  return {
    ...dated,
    title: listingTitle(dated.title),
    subtitle: formatWhenVenue(dated) || dated.subtitle,
  }
}

export function MarketplaceScreen({ onSelect }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState(MARKET_FILTERS[0].id)
  const [selling, setSelling] = useState(false)
  const [mine, setMine] = useState([])

  const drop = filter === 'drop'
  const canSell = filter === 'tickets' || filter === 'bracelets'
  const featuredDrops = useMemo(
    () => products.items.filter((item) => item.featured),
    [],
  )
  const items = useMemo(() => {
    if (drop) {
      return products.items
        .filter((item) => matchesQuery(item, query))
        .sort((a, b) => dropRank(a) - dropRank(b))
    }
    return [...mine, ...catalog.items]
      .map(listingItem)
      .filter(
        (item) => item.filters.includes(filter) && matchesQuery(item, query),
      )
  }, [drop, filter, mine, query])

  return (
    <section className="screen screen-market">
      <ScreenHeader title="Market" />
      <div className="sheet">
        <FeaturedBanner
          items={featuredDrops}
          onSelect={onSelect}
          caption={(item) => `${item.city} · ${formatCost(item)} · ${item.shop}`}
        />
        <div className="list-toolbar">
          <p className="count-line">
            {drop
              ? `${items.length} products`
              : `${items.length} listings · platinum access`}
          </p>
          {canSell ? (
            <button
              type="button"
              className="filter-launch"
              onClick={() => setSelling(true)}
            >
              Sell your ticket
            </button>
          ) : null}
        </div>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={
            drop
              ? 'Search lifestyle, shopping, travel'
              : filter === 'bracelets'
                ? 'Search bracelets'
                : 'Search second-hand tickets'
          }
        />
        <FilterTabs
          filters={MARKET_FILTERS}
          active={filter}
          onChange={setFilter}
        />
        <div className="item-list">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              meta={drop ? `${item.shop} · ${item.city}` : formatCost(item)}
              pinned={drop && TOP_DROPS.includes(item.id)}
              onSelect={onSelect}
            />
          ))}
          {items.length === 0 ? (
            <p className="empty">
              {drop ? 'No products in this aisle.' : 'No listings in this lane.'}
            </p>
          ) : null}
        </div>
      </div>
      <SellTicketSheet
        open={selling}
        onClose={() => setSelling(false)}
        onList={(event) => {
          setMine((current) => [
            {
              id: `sell-${event.id}-${Date.now()}`,
              eventId: event.id,
              title: event.title,
              tickets: 1,
              shop: `From ${ME.name}`,
              seller: ME,
              city: event.city,
              date: event.date,
              time: event.time,
              venue: event.venue,
              pricePbs: event.pricePbs,
              priceIls: event.priceIls,
              originalPbs: event.pricePbs,
              image: event.image,
              filters: ['tickets'],
            },
            ...current,
          ])
          setFilter('tickets')
        }}
      />
    </section>
  )
}
