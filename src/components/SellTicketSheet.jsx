import { useState } from 'react'
import events from '../data/events.json'
import { formatPbs } from '../lib/format.js'

const OPTIONS = events.items
  .filter((item) => item.country === 'IL' && item.type !== 'travel')
  .slice(0, 6)

export function SellTicketSheet({ open, onClose, onList }) {
  const [eventId, setEventId] = useState(OPTIONS[0]?.id)
  const picked = OPTIONS.find((item) => item.id === eventId) || OPTIONS[0]

  if (!open || !picked) return null

  return (
    <div className="drawer-root">
      <button
        type="button"
        className="drawer-scrim"
        onClick={onClose}
        aria-label="Close sell ticket"
      />
      <aside className="drawer-panel" role="dialog" aria-label="Sell your ticket">
        <header className="drawer-head">
          <h2>Sell your ticket</h2>
          <button type="button" className="drawer-text" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="drawer-body sell-body">
          <p>
            List at the original price. Buyers see your profile photo, not points.
            Asking or taking more than the original price is illegal.
          </p>
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
          <p className="price-range-readout">{formatPbs(picked.pricePbs)} original</p>
        </div>
        <button
          type="button"
          className="pay-btn drawer-done"
          onClick={() => {
            onList(picked)
            onClose()
          }}
        >
          List ticket
        </button>
      </aside>
    </div>
  )
}
