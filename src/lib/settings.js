import { HEADER_TINTS } from './tints.js'

const STEPS = [0, 250, 600, 1200, 2000, 3000]

const GOLD = {
  id: 'gold',
  label: 'Gold',
  rank: 7,
  minP: 4200,
  top: '#e8c878',
  glow: '#8a6a28',
  deep: '#3a2a0c',
  mid: '#8a6418',
  lift: '#d1b45f',
  fallback: '#b8923a',
}

export const WALLET_RANKS = [
  ...HEADER_TINTS.map((tint, index) => ({
    ...tint,
    rank: index + 1,
    minP: STEPS[index],
    fallback: tint.mid,
  })),
  GOLD,
]

export function rankForBalance(balance) {
  return (
    [...WALLET_RANKS].reverse().find((item) => balance >= item.minP) ??
    WALLET_RANKS[0]
  )
}

export function rankVars(balance) {
  const rank = rankForBalance(balance)
  return {
    '--wallet-top': rank.top,
    '--wallet-glow': rank.glow,
    '--wallet-deep': rank.deep,
    '--wallet-mid': rank.mid,
    '--wallet-lift': rank.lift,
    '--wallet-fallback': rank.fallback,
  }
}
