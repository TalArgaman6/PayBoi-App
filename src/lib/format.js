export function formatWhen(date, time) {
  if (!date) return ''
  const value = new Date(`${date}T${time || '00:00'}`)
  if (Number.isNaN(value.getTime())) return date
  return value.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: time ? '2-digit' : undefined,
    minute: time ? '2-digit' : undefined,
  })
}

export function formatWhenVenue(item) {
  if (!item?.date || !item?.venue) return ''
  return `${formatWhen(item.date, item.time)} · ${item.venue}`
}

export function listingTitle(title) {
  return String(title || '')
    .replace(/\s+[—-]\s*\d+\s+tickets?\s*$/i, '')
    .replace(/\s+X\d+\s*$/i, '')
    .trim()
}

export const PBS_PER_ILS = 3

export function formatPbs(amount) {
  return `${Number(amount).toLocaleString('en-US')} pbs`
}

export function assetUrl(path) {
  if (!path) return ''
  if (/^(blob:|https?:|data:)/.test(path)) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

export function formatEarn(amount) {
  return `+${amount}`
}

export function ilsAmount(item) {
  if (item?.priceIls != null) return item.priceIls
  return Math.round((item?.pricePbs ?? 0) / PBS_PER_ILS)
}

export function formatCost(item) {
  return `₪${ilsAmount(item)} / ${item?.pricePbs ?? 0} pbs`
}

export function formatFixedPrice(item) {
  return `₪${ilsAmount(item)} / fixed`
}

export function earnAmount(item) {
  if (item?.earnPbs != null) return item.earnPbs
  const pbs = item?.pricePbs ?? 0
  return Math.round(8 + Math.max(0, Math.min(1, (pbs - 200) / 1000)) * 42)
}

export function isEventItem(item) {
  return Boolean(item?.venue) && !item?.shop
}

export function formatTokenBalance(amount) {
  return Number(amount).toLocaleString('en-US')
}

const LAST_BY_ID = {
  tal: 'Argaman',
  alex: 'Cohen',
  maya: 'Levi',
  ido: 'Goldberg',
  noa: 'Oz',
  sam: 'Meir',
  jordan: 'Levi',
}

function titleCase(word) {
  const value = String(word || '').trim()
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export function shortName(input, lastName) {
  if (!input) return ''
  if (typeof input === 'object') {
    const given = String(input.name || '').trim()
    const hasSurname = given.split(/\s+/).filter(Boolean).length > 1
    const fallback = input.last || (hasSurname ? undefined : LAST_BY_ID[input.id])
    return shortName(given, lastName || fallback)
  }

  const raw = String(input).trim()
  if (raw.includes('.')) {
    const [first, last] = raw.split('.')
    return shortName(first, lastName || last)
  }

  const parts = raw.split(/\s+/).filter(Boolean)
  const first = titleCase(parts[0])
  const last = lastName || parts[1] || LAST_BY_ID[first.toLowerCase()]
  if (!last) return first
  return `${first} ${titleCase(last)}`
}

const CROWD_NAMES = [
  'Tal A',
  'Maya L',
  'Alex C',
  'Ido M',
  'Noa S',
  'Sam A',
  'Jordan H',
  'Gal W',
  'Itay A',
]

function crowdHash(value) {
  return [...String(value)].reduce((sum, char) => (sum * 33 + char.charCodeAt(0)) >>> 0, 7)
}

export function boughtLine(item) {
  const hash = crowdHash(item?.id || item?.title)
  const name = CROWD_NAMES[hash % CROWD_NAMES.length]
  const extra = 1 + ((hash >> 4) % 8)
  const noun = extra === 1 ? 'friend' : 'friends'
  return `${name} + ${extra} ${noun} will be there`
}

export function matchesQuery(item, query) {
  if (!query.trim()) return true
  const haystack = [
    item.title,
    item.subtitle,
    item.venue,
    item.shop,
    item.seller?.name,
    item.city,
    item.date,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(query.trim().toLowerCase())
}
