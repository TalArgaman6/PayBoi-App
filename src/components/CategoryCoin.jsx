function giftWeight(gift) {
  return gift.worth ?? gift.count
}

function mix(hex, amount) {
  const value = hex.replace('#', '')
  const n = Number.parseInt(value, 16)
  const channels = [n >> 16, (n >> 8) & 255, n & 255]
  const next = channels.map((channel) => {
    if (amount >= 0) return Math.round(channel + (255 - channel) * amount)
    return Math.round(channel * (1 + amount))
  })
  return `#${next.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

export function CategoryCoin({ gifts, activeId, onPick }) {
  const size = 220
  const center = size / 2
  const radius = 78
  const stroke = 24
  const circumference = 2 * Math.PI * radius
  const total = gifts.reduce((sum, gift) => sum + giftWeight(gift), 0) || 1
  const gap = 5
  const picking = Boolean(activeId)

  let offset = 0
  const slices = gifts.map((gift) => {
    const slice = (giftWeight(gift) / total) * circumference
    const item = {
      gift,
      length: Math.max(slice - gap, 2),
      offset,
      lit: activeId === gift.id,
    }
    offset += slice
    return item
  })
  const rest = slices.filter((item) => !item.lit)
  const lit = slices.find((item) => item.lit)

  return (
    <svg
      className={`category-coin${picking ? ' is-picking' : ''}`}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="i win mix by perk"
    >
      <defs>
        <linearGradient id="ring-shine" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gold-p" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#e4d39a" />
          <stop offset="100%" stopColor="#d1b45f" />
        </linearGradient>
        <linearGradient id="gold-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ddc582" />
          <stop offset="100%" stopColor="#d1b45f" />
        </linearGradient>
        <linearGradient id="silver-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bcc1c7" />
          <stop offset="100%" stopColor="#a7adb5" />
        </linearGradient>
        <linearGradient id="lit-shine" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="slice-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {gifts.map((gift) => {
          if (gift.metal === 'gold' || gift.metal === 'silver') return null
          return (
            <linearGradient
              key={gift.id}
              id={`metal-${gift.id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={mix(gift.color, 0.14)} />
              <stop offset="100%" stopColor={gift.color} />
            </linearGradient>
          )
        })}
      </defs>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#e4e0e8"
        strokeWidth={stroke}
      />
      {[...rest, ...(lit ? [lit] : [])].map((item) => (
        <circle
          key={item.gift.id}
          className={`coin-slice${item.lit ? ' is-lit' : ''}`}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={
            item.gift.metal === 'gold'
              ? 'url(#gold-metal)'
              : item.gift.metal === 'silver'
                ? 'url(#silver-metal)'
                : `url(#metal-${item.gift.id})`
          }
          strokeWidth={item.lit ? 26 : stroke}
          strokeDasharray={`${item.length} ${circumference - item.length}`}
          strokeDashoffset={-item.offset}
          strokeLinecap="butt"
          filter={item.lit ? 'url(#slice-glow)' : undefined}
          pointerEvents="stroke"
          transform={`rotate(-90 ${center} ${center})`}
          onClick={() => onPick?.(item.gift.id)}
        />
      ))}
      {lit ? (
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#lit-shine)"
          strokeWidth="26"
          strokeDasharray={`${lit.length} ${circumference - lit.length}`}
          strokeDashoffset={-lit.offset}
          strokeLinecap="butt"
          pointerEvents="none"
          transform={`rotate(-90 ${center} ${center})`}
        />
      ) : (
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#ring-shine)"
          strokeWidth={stroke}
          strokeDasharray={`${circumference * 0.34} ${circumference}`}
          strokeDashoffset={circumference * 0.04}
          pointerEvents="none"
          transform={`rotate(-90 ${center} ${center})`}
        />
      )}
      <circle
        cx={center}
        cy={center}
        r={radius - stroke / 2 - 1}
        fill="none"
        stroke="url(#gold-p)"
        strokeWidth="1.2"
        opacity="0.9"
      />
    </svg>
  )
}
