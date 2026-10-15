const USED_KEY = 'pboi.passes.used'
/*
 * Passes earned since the wallet opened. wallet.json says how many of each
 * perk a night out came with, and that figure never changes — so anything
 * picked up after the fact is counted here and added to it. Kept apart from
 * the spent list because the two answer different questions: that one is
 * which codes have been read, this one is how many there were to read.
 */
const EXTRA_KEY = 'pboi.passes.extra'

function readExtra() {
  try {
    const raw = JSON.parse(localStorage.getItem(EXTRA_KEY) || '{}')
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

function extraFor(giftId) {
  const held = readExtra()[giftId]
  return Number.isFinite(held) && held > 0 ? Math.floor(held) : 0
}

// How many of this perk exist at all: what the night came with, plus what has
// been added since.
function heldCount(gift) {
  return gift.count + extraFor(gift.id)
}

export function addPass(gift) {
  const extra = readExtra()
  extra[gift.id] = extraFor(gift.id) + 1
  localStorage.setItem(EXTRA_KEY, JSON.stringify(extra))
  window.dispatchEvent(new Event('pboi-passes'))
  return heldCount(gift)
}

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
  return Math.max(0, heldCount(gift) - spent)
}

export function passCounts(gifts, used = readUsed()) {
  return Object.fromEntries(gifts.map((gift) => [gift.id, remainingCount(gift, used)]))
}

/*
 * Every pass still in hand, in order. The top of the deck is the first of
 * them; the rest are what the stack behind it is made of, and each one is a
 * different code — the slivers down the left edge are real passes, so they
 * ought not to be five copies of the same picture.
 */
export function remainingTokens(gift, used = readUsed()) {
  const tokens = []
  const held = heldCount(gift)
  for (let index = 1; index <= held; index += 1) {
    const token = tokenFor(gift.id, index)
    if (!used.includes(token)) tokens.push(token)
  }
  return tokens
}

export function nextPassToken(gift, used = readUsed()) {
  const held = heldCount(gift)
  for (let index = 1; index <= held; index += 1) {
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
  if (!gift || index < 1 || index > heldCount(gift)) return null
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
