const USED_KEY = 'pboi.passes.used'

function readUsed() {
  try {
    const raw = JSON.parse(localStorage.getItem(USED_KEY) || '[]')
    return Array.isArray(raw) ? raw.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

function writeUsed(used) {
  localStorage.setItem(USED_KEY, JSON.stringify(used))
  window.dispatchEvent(new Event('pboi-passes'))
}

function tokenFor(giftId, index) {
  return `${giftId}.${index}`
}

export function remainingCount(gift, used = readUsed()) {
  const spent = used.filter((token) => token.startsWith(`${gift.id}.`)).length
  return Math.max(0, gift.count - spent)
}

export function passCounts(gifts, used = readUsed()) {
  return Object.fromEntries(gifts.map((gift) => [gift.id, remainingCount(gift, used)]))
}

export function nextPassToken(gift, used = readUsed()) {
  for (let index = 1; index <= gift.count; index += 1) {
    const token = tokenFor(gift.id, index)
    if (!used.includes(token)) return token
  }
  return null
}

export function passUrl(token) {
  const url = new URL(import.meta.env.BASE_URL, window.location.origin)
  url.searchParams.set('redeem', token)
  return url.toString()
}

export function redeemPass(token, gifts) {
  const match = /^([a-z0-9-]+)\.(\d+)$/.exec(token || '')
  if (!match) return null
  const id = match[1]
  const index = Number(match[2])
  const gift = gifts.find((item) => item.id === id)
  if (!gift || index < 1 || index > gift.count) return null
  const key = tokenFor(id, index)
  const used = readUsed()
  if (!used.includes(key)) {
    used.push(key)
    writeUsed(used)
  }
  return id
}

export function consumeLocationRedeem(gifts) {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const token = params.get('redeem')
  if (!token) return null
  const id = redeemPass(token, gifts)
  params.delete('redeem')
  const query = params.toString()
  const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  window.history.replaceState(null, '', next)
  return id
}

export function watchPasses(onChange) {
  const onStorage = (event) => {
    if (event.key === USED_KEY) onChange()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener('pboi-passes', onChange)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('pboi-passes', onChange)
  }
}
