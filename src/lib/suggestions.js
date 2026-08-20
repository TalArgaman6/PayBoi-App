import events from '../data/events.json'
import products from '../data/products.json'

function withKind(items, kind) {
  return items.map((item) => ({ ...item, kind }))
}

function pickDiverse(items, limit) {
  const used = new Set()
  const picks = []
  const buckets = ['travel', 'party', 'bar', 'sports', 'shop']

  for (const bucket of buckets) {
    const match = items.find((item) => {
      if (used.has(item.id)) return false
      if (bucket === 'shop') return item.kind === 'shop'
      return item.type === bucket
    })
    if (match) {
      used.add(match.id)
      picks.push(match)
    }
  }

  for (const item of items) {
    if (picks.length >= limit) break
    if (!used.has(item.id)) {
      used.add(item.id)
      picks.push(item)
    }
  }

  return picks.slice(0, limit)
}

export function suggestionsForBalance(balance, { limit = 8, diverse = true } = {}) {
  const affordable = [
    ...withKind(events.items, 'event'),
    ...withKind(products.items, 'shop'),
  ]
    .filter((item) => item.pricePbs <= balance)
    .map((item) => ({
      ...item,
      leftover: balance - item.pricePbs,
    }))
    .sort((left, right) => {
      const featured = Number(Boolean(right.featured)) - Number(Boolean(left.featured))
      if (featured) return featured
      return right.pricePbs - left.pricePbs
    })

  return diverse ? pickDiverse(affordable, limit) : affordable
}

export function kindLabel(kind) {
  if (kind === 'shop') return 'Drop'
  if (kind === 'marketplace') return 'Resale'
  return 'Event'
}
