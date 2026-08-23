import { useMemo, useState } from 'react'
import catalog from '../data/marketplace.json'
import events from '../data/events.json'
import wallet from '../data/wallet.json'
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

const EVENTS = Object.fromEntries(events.items.map((item) => [item.id, item]))

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
  const [filter, setFilter] = useState(catalog.filters[0].id)
  const [selling, setSelling] = useState(false)
  const [mine, setMine] = useState([])

  const items = useMemo(
    () =>
      [...mine, ...catalog.items]
        .map(listingItem)
        .filter(
          (item) => item.filters.includes(filter) && matchesQuery(item, query),
        ),
    [filter, mine, query],
  )

  return (
    <section className="screen screen-market">
      <ScreenHeader title="Marketplace" />
      <div className="sheet">
        <div className="list-toolbar">
          <p className="count-line">
            {items.length} listings · platinum access
          </p>
          <button
            type="button"
            className="filter-launch"
            onClick={() => setSelling(true)}
          >
            Sell your ticket
          </button>
        </div>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search second-hand tickets"
        />
        <FilterTabs
          filters={catalog.filters}
          active={filter}
          onChange={setFilter}
        />
        <div className="item-list">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              meta={formatCost(item)}
              onSelect={onSelect}
            />
          ))}
          {items.length === 0 ? (
            <p className="empty">No listings in this lane.</p>
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
              filters: ['tickets', 'transfers'],
            },
            ...current,
          ])
          setFilter('tickets')
        }}
      />
    </section>
  )
}
