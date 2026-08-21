import { EarnBadge } from './EarnBadge.jsx'
import { SellerFace } from './SellerFace.jsx'
import { formatCost, isEventItem, assetUrl } from '../lib/format.js'

export function ItemThumb({ thumb, title, image }) {
  const label = thumb?.label || title.slice(0, 2).toUpperCase()

  if (image) {
    return (
      <div className="item-thumb">
        <img src={assetUrl(image)} alt="" />
      </div>
    )
  }

  return (
    <div
      className="item-thumb"
      style={{
        background: `linear-gradient(145deg, ${thumb?.from || '#4a4548'}, ${thumb?.to || '#d1b45f'})`,
      }}
      aria-hidden="true"
    >
      <span>{label}</span>
    </div>
  )
}

export function RideMark({ count }) {
  if (!count) return null

  return (
    <span className="ride-mark" title={`${count} shared rides from your area`}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M3.2 10.2h9.6M4 10.2l.7-3.1c.1-.5.6-.9 1.1-.9h4.4c.5 0 1 .4 1.1.9l.7 3.1M5.1 6.2h5.8M4.6 12.1a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Zm6.8 0a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {count}
    </span>
  )
}

export function ItemRow({ item, meta, onSelect }) {
  const event = isEventItem(item)

  return (
    <button type="button" className="item-row" onClick={() => onSelect?.(item)}>
      <ItemThumb thumb={item.thumb} title={item.title} image={item.image} />
      <div className="item-copy">
        <div className="item-title-row">
          <strong>{item.title}</strong>
          <RideMark count={item.rides} />
        </div>
        {item.subtitle ? <span className="item-sub">{item.subtitle}</span> : null}
        {meta ? <span className="item-meta">{meta}</span> : null}
      </div>
      {item.seller ? (
        <SellerFace seller={item.seller} />
      ) : (
        <span className="item-price">
          <span className="cost-mark">{formatCost(item)}</span>
          {event ? <EarnBadge item={item} /> : null}
        </span>
      )}
    </button>
  )
}
