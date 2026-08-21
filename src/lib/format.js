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
  return Math.round((item?.pricePbs ?? 0) * 0.375)
}

export function formatCost(item) {
  return `₪${ilsAmount(item)} / ${item?.pricePbs ?? 0} pbs`
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
