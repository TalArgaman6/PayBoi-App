import { useMemo, useState } from 'react'
import catalog from '../data/products.json'
import { FilterTabs } from '../components/FilterTabs.jsx'
import { ItemRow } from '../components/ItemRow.jsx'
import { ScreenHeader } from '../components/ScreenHeader.jsx'
import { SearchBar } from '../components/SearchBar.jsx'
import { matchesQuery } from '../lib/format.js'

export function ShopScreen({ onSelect }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState(catalog.filters[0].id)

  const items = useMemo(
    () =>
      catalog.items.filter(
        (item) =>
          (filter === 'all' || item.filters.includes(filter)) &&
          matchesQuery(item, query),
      ),
    [filter, query],
  )

  return (
    <section className="screen screen-spend">
      <ScreenHeader title="Drop" />
      <div className="sheet">
        <p className="count-line">{items.length} products</p>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search lifestyle, shopping, travel"
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
              meta={`${item.shop} · ${item.city}`}
              onSelect={onSelect}
            />
          ))}
          {items.length === 0 ? (
            <p className="empty">No products in this aisle.</p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
