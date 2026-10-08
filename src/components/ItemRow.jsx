import { EarnBadge } from './EarnBadge.jsx'
import { SellerFace } from './SellerFace.jsx'
import { formatCost, assetUrl } from '../lib/format.js'

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

function TicketIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M2.5 5h11c.5 0 .9.3.9.8v.9a1.2 1.2 0 0 0 0 2.6v.9c0 .5-.4.8-.9.8h-11c-.5 0-.9-.3-.9-.8v-.9a1.2 1.2 0 0 0 0-2.6v-.9c0-.5.4-.8.9-.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path
        d="M6.2 5.15v5.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeDasharray="1.1 1.65"
      />
    </svg>
  )
}

function BraceletIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4.7 4.2a4.35 4.35 0 1 0 6.6 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M4.7 4.2h1.7M9.6 4.2h1.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function TicketMark({ count, kind = 'ticket' }) {
  const total = Math.min(3, Math.max(0, Number(count) || 0))
  if (!total) return null
  const bracelet = kind === 'bracelet'
  const noun = bracelet
    ? total === 1 ? 'bracelet' : 'bracelets'
    : total === 1 ? 'ticket' : 'tickets'
  const Icon = bracelet ? BraceletIcon : TicketIcon

  return (
    <span
      className={`ticket-mark${bracelet ? ' is-bracelet' : ''}`}
      title={`${total} ${noun}`}
    >
      {Array.from({ length: total }, (_, index) => (
        <Icon key={index} />
      ))}
    </span>
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

export function ItemRow({ item, meta, note, onSelect, showEarn = false }) {
  return (
    <button type="button" className="item-row" onClick={() => onSelect?.(item)}>
      <ItemThumb thumb={item.thumb} title={item.title} image={item.image} />
      <div className="item-copy">
        <div className="item-title-row">
          <strong>{item.title}</strong>
          <TicketMark
            count={item.tickets}
            kind={item.filters?.includes('bracelets') ? 'bracelet' : 'ticket'}
          />
          <RideMark count={item.rides} />
        </div>
        {item.subtitle ? <span className="item-sub">{item.subtitle}</span> : null}
        {meta ? <span className="item-meta">{meta}</span> : null}
        {note ? <span className="item-bought">{note}</span> : null}
      </div>
      {item.seller ? (
        <SellerFace seller={item.seller} />
      ) : (
        <span className="item-price">
          <span className="cost-mark">{formatCost(item)}</span>
          {showEarn ? <EarnBadge item={item} /> : null}
        </span>
      )}
    </button>
  )
}
