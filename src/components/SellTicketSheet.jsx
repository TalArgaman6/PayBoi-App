import { useState } from 'react'
import events from '../data/events.json'
import { ItemThumb } from './ItemRow.jsx'
import { formatCost } from '../lib/format.js'

const OPTIONS = events.items
  .filter((item) => item.country === 'IL' && item.type !== 'travel')
  .slice(0, 6)

export function SellTicketSheet({ open, onClose, onList }) {
  const [eventId, setEventId] = useState(OPTIONS[0]?.id)
  const picked = OPTIONS.find((item) => item.id === eventId) || OPTIONS[0]

  if (!open || !picked) return null

  return (
    <aside className="detail-sheet" role="dialog" aria-label="Sell your ticket">
      <div className="detail-handle" />
      <div className="detail-head">
        <ItemThumb image={picked.image} title={picked.title} />
        <div>
          <strong>{picked.title}</strong>
          <span>{picked.subtitle}</span>
        </div>
        <span className="item-price">
          <span className="cost-mark">{formatCost(picked)}</span>
        </span>
      </div>
      <p>List at the ticket price. Buyers see your profile photo, not points.</p>
      <label className="sell-field">
        Event
        <select
          value={picked.id}
          onChange={(event) => setEventId(event.target.value)}
        >
          {OPTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="pay-btn"
        onClick={() => {
          onList(picked)
          onClose()
        }}
      >
        List ticket
      </button>
      <button type="button" className="ghost-btn" onClick={onClose}>
        Close
      </button>
    </aside>
  )
}
