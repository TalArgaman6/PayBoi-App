import { useMemo, useState } from 'react'
import catalog from '../data/marketplace.json'
import wallet from '../data/wallet.json'
import { FilterTabs } from '../components/FilterTabs.jsx'
import { ItemRow } from '../components/ItemRow.jsx'
import { ScreenHeader } from '../components/ScreenHeader.jsx'
import { SearchBar } from '../components/SearchBar.jsx'
import { SellTicketSheet } from '../components/SellTicketSheet.jsx'
import { formatPbs, matchesQuery } from '../lib/format.js'

const ME = {
  name: wallet.nickname,
  photo: wallet.photo,
}

export function MarketplaceScreen({ onSelect }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState(catalog.filters[0].id)
  const [selling, setSelling] = useState(false)
  const [mine, setMine] = useState([])

  const items = useMemo(
    () =>
      [...mine, ...catalog.items].filter(
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
              meta={`original ${formatPbs(item.originalPbs)}`}
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
              title: `${event.title} — 1 ticket`,
              subtitle: 'Resale at original price',
              shop: `From ${ME.name}`,
              seller: ME,
              city: event.city,
              pricePbs: event.pricePbs,
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
