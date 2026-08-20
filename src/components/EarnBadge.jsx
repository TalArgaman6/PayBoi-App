import { earnAmount, formatEarn } from '../lib/format.js'

export function EarnBadge({ item }) {
  const points = earnAmount(item)

  return (
    <span className="earn-badge" title={`Gain ${points} p at this party`}>
      {formatEarn(points)}
      <small>p</small>
    </span>
  )
}
