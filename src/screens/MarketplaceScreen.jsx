import { useMemo, useState } from 'react'
import catalog from '../data/marketplace.json'
import { FilterTabs } from '../components/FilterTabs.jsx'
import { ItemRow } from '../components/ItemRow.jsx'
import { ScreenHeader } from '../components/ScreenHeader.jsx'
import { SearchBar } from '../components/SearchBar.jsx'
import { matchesQuery } from '../lib/format.js'

export function MarketplaceScreen({ onSelect }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState(catalog.filters[0].id)

  const items = useMemo(
    () =>
      catalog.items.filter(
        (item) => item.filters.includes(filter) && matchesQuery(item, query),
      ),
    [filter, query],
  )

  return (
    <section className="screen">
      <ScreenHeader title="Marketplace" kicker="Pre-owned, same price" />
      <div className="sheet">
        <p className="count-line">
          {items.length} listings · platinum access
        </p>
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
              meta={`${item.shop} · p${item.originalPbs} original`}
              onSelect={onSelect}
            />
          ))}
          {items.length === 0 ? (
            <p className="empty">No listings in this lane.</p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
