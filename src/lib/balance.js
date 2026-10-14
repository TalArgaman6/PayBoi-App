import { useEffect, useState } from 'react'
import wallet from '../data/wallet.json'

/*
 * What's in the wallet, as something that can change during a session.
 * wallet.json is the opening position and nothing more: once a deal goes
 * through, the balance has to move on the card, in the rank the phone is
 * tinted by and in the "what's left after this" line on every sheet. A module
 * store rather than a context because there is exactly one wallet, and every
 * screen that shows it wants the same number.
 */

// The shekel line tracks the token balance at the rate the two opened at, so
// the pair stays consistent without a second source of truth.
const RATE = wallet.fiat / wallet.balance

let balance = wallet.balance
const listeners = new Set()

export function getBalance() {
  return balance
}

export function getFiat() {
  return Math.round(balance * RATE)
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function spend(amount) {
  const cost = Math.max(0, Math.round(amount || 0))
  if (!cost) return balance
  balance = Math.max(0, balance - cost)
  for (const listener of listeners) listener(balance)
  return balance
}

/*
 * The same spend, taken slowly. A peer deal lands the buyer back on the wallet
 * and the point of sending them there is to watch the number go down, so the
 * balance walks from the old figure to the new one over a beat or so instead
 * of swapping. Every frame notifies, which is what makes the digits roll.
 */
let counting = false
const countListeners = new Set()

function setCounting(next) {
  if (counting === next) return
  counting = next
  for (const listener of countListeners) listener(counting)
}

function countTo(to, ms) {
  const from = balance
  if (from === to) return
  const start = performance.now()
  setCounting(true)

  function step(now) {
    const t = Math.min(1, (now - start) / ms)
    // Out-cubic: it leaves fast and settles onto the final figure, so the last
    // digit lands rather than creeping.
    const eased = 1 - (1 - t) ** 3
    balance = t >= 1 ? to : Math.round(from + (to - from) * eased)
    for (const listener of listeners) listener(balance)
    if (t < 1) window.requestAnimationFrame(step)
    else setCounting(false)
  }

  window.requestAnimationFrame(step)
}

export function spendOver(amount, ms = 1500) {
  const cost = Math.max(0, Math.round(amount || 0))
  if (!cost) return
  countTo(Math.max(0, balance - cost), ms)
}

// The same walk upward. A top-up is the one time the number is good news, so
// it gets the same roll rather than appearing fully formed.
export function earnOver(amount, ms = 1500) {
  const gain = Math.max(0, Math.round(amount || 0))
  if (!gain) return
  countTo(balance + gain, ms)
}

export function useCounting() {
  const [value, setValue] = useState(counting)
  useEffect(() => {
    countListeners.add(setValue)
    return () => countListeners.delete(setValue)
  }, [])
  return value
}

export function earn(amount) {
  const gain = Math.max(0, Math.round(amount || 0))
  if (!gain) return balance
  balance += gain
  for (const listener of listeners) listener(balance)
  return balance
}

export function useBalance() {
  const [value, setValue] = useState(balance)
  useEffect(() => subscribe(setValue), [])
  return value
}
