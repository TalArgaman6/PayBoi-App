import { earnAmount } from '../lib/format.js'
import { TokenMark } from './TokenMark.jsx'

export function EarnBadge({ item }) {
  const points = earnAmount(item)

  return (
    <span className="earn-badge" title={`Gain ${points} pck at this party`}>
      {/* The sign first, then the currency, then the figure — the order a
          statement line uses, and the order that keeps "+" reading as the
          direction of the whole amount rather than as part of the number. */}
      <span className="earn-sign" aria-hidden="true">+</span>
      <TokenMark />
      {points}
    </span>
  )
}
