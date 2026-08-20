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

export function formatPbs(amount) {
  return `p${amount}`
}

export function assetUrl(path) {
  if (!path) return ''
  if (/^(blob:|https?:|data:)/.test(path)) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

export function formatEarn(amount) {
  return `+${amount}`
}

export function earnAmount(item) {
  return item?.earnPbs ?? item?.pricePbs ?? 0
}

export function isEventItem(item) {
  return Boolean(item?.venue) && !item?.shop
}

export function formatTokenBalance(amount) {
  return Number(amount).toLocaleString('en-US')
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
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(query.trim().toLowerCase())
}
