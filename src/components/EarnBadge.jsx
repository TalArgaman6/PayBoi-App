import { earnAmount, formatEarn } from '../lib/format.js'

export function EarnBadge({ item }) {
  const points = earnAmount(item)

  return (
    <span className="earn-badge" title={`Gain ${points} pck at this party`}>
      {formatEarn(points)}
      <small>pck</small>
    </span>
  )
}
