import { earnAmount, formatEarn } from '../lib/format.js'

export function EarnBadge({ item }) {
  const points = earnAmount(item)

  return (
    <span className="earn-badge" title={`Gain ${points} pbs at this party`}>
      {formatEarn(points)}
      <small>pbs</small>
    </span>
  )
}
