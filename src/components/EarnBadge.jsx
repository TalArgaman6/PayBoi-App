import { earnAmount, formatEarn } from '../lib/format.js'

export function EarnBadge({ item }) {
  const points = earnAmount(item)

  return (
    <span className="earn-badge" title={`Gain ${points} points at this party`}>
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
        <path
          d="M8 13V3M8 3l-3.2 3.2M8 3l3.2 3.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {formatEarn(points)}
      <small>pts</small>
    </span>
  )
}
