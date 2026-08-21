import { formatCost } from '../lib/format.js'

export function EarnBadge({ item }) {
  return (
    <span className="cost-mark" title={formatCost(item)}>
      {formatCost(item)}
    </span>
  )
}
