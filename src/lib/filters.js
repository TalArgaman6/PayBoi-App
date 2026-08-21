export const PRICE_RANGES = [
  { id: 'all', label: 'Any', min: 0, max: Infinity },
  { id: 'cover', label: '≤ p200', min: 0, max: 200 },
  { id: 'night', label: 'p201–400', min: 201, max: 400 },
  { id: 'weekend', label: 'p401–800', min: 401, max: 800 },
  { id: 'trip', label: 'p800+', min: 801, max: Infinity },
]

export const PRICE_SLIDER = {
  min: 0,
  max: 1200,
  step: 20,
}

export const DEFAULT_COUNTRY = 'IL'

export const CURRENCY_META = {
  ILS: { label: '₪ ILS', prefix: '₪' },
  EUR: { label: '€ EUR', prefix: '€' },
  CHF: { label: 'CHF', prefix: 'CHF ' },
  USD: { label: '$ USD', prefix: '$' },
  GBP: { label: '£ GBP', prefix: '£' },
  BRL: { label: 'R$ BRL', prefix: 'R$' },
  AUD: { label: 'A$ AUD', prefix: 'A$' },
  MXN: { label: 'MX$ MXN', prefix: 'MX$' },
  THB: { label: '฿ THB', prefix: '฿' },
}

export const COUNTRY_CURRENCY = {
  IL: 'ILS',
  US: 'USD',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BR: 'BRL',
  AU: 'AUD',
  MX: 'MXN',
  TH: 'THB',
  CH: 'CHF',
  SEA: 'USD',
}

const USD_PER_PBS = 0.1294
const FROM_USD = {
  USD: 1,
  ILS: 3.7,
  EUR: 0.92,
  CHF: 0.88,
  GBP: 0.79,
  BRL: 5.4,
  AUD: 1.52,
  MXN: 17.5,
  THB: 35,
}

export function currencyForCountry(country) {
  return COUNTRY_CURRENCY[country] || 'USD'
}

export function currencyLabel(currency) {
  return CURRENCY_META[currency]?.label || currency
}

export function eventCurrency(item) {
  return currencyForCountry(item.country)
}

export function toLocal(pbs, currency) {
  return pbs * USD_PER_PBS * (FROM_USD[currency] || 1)
}

export function formatLocal(pbs, currency, item) {
  if (item?.priceIls != null && currency === 'ILS') {
    return `₪${item.priceIls}`
  }
  const value = toLocal(pbs, currency)
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10
  const prefix = CURRENCY_META[currency]?.prefix || '$'
  return `${prefix}${rounded}`
}

export function inPriceRange(item, rangeId) {
  const range = PRICE_RANGES.find((entry) => entry.id === rangeId) || PRICE_RANGES[0]
  const price = item.pricePbs ?? 0
  return price >= range.min && price <= range.max
}

export function inPbsSpan(item, min, max) {
  const price = item.pricePbs ?? 0
  return price >= min && price <= max
}

export function isFullPriceSpan(min, max) {
  return min <= PRICE_SLIDER.min && max >= PRICE_SLIDER.max
}
