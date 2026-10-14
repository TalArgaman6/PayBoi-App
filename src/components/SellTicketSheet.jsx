import { useRef, useState } from 'react'
import events from '../data/events.json'
import { ItemThumb } from './ItemRow.jsx'
import { useDismissOnOutside } from '../lib/dismiss.js'

const OPTIONS = events.items
  .filter((item) => item.country === 'IL' && item.type !== 'travel')
  .slice(0, 6)

// Five is the per-listing cap, whatever you hold.
const MAX_TICKETS = 5

/*
 * How many tickets you hold for an event. There is no holdings record in the
 * sample data, so this is derived from the id — stable for a given event, so
 * the ratio doesn't jump around as you flick through the picker.
 */
function heldCount(id) {
  let sum = 0
  for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i)
  return (sum % MAX_TICKETS) + 1
}

export function SellTicketSheet({ open, onClose, onList }) {
  const [eventId, setEventId] = useState(OPTIONS[0]?.id)
  const [count, setCount] = useState(1)
  const picked = OPTIONS.find((item) => item.id === eventId) || OPTIONS[0]
  const cap = picked ? Math.min(heldCount(picked.id), MAX_TICKETS) : 1
  // Switching events can land on a smaller holding than the current pick.
  const listing = Math.min(count, cap)
  const sheet = useRef(null)
  useDismissOnOutside(sheet, open, onClose)

  if (!open || !picked) return null

  return (
    <aside
      ref={sheet}
      className="detail-sheet"
      role="dialog"
      aria-label="Sell your ticket"
    >
      <div className="detail-handle" />
      <div className="detail-head">
        <ItemThumb image={picked.image} title={picked.title} />
        <div>
          <strong>{picked.title}</strong>
          <span>{picked.subtitle}</span>
        </div>
      </div>
      <label className="sell-field">
        Event
        <select
          value={picked.id}
          onChange={(event) => {
            setEventId(event.target.value)
            setCount(1)
          }}
        >
          {OPTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </label>
      <div className="sell-field">
        <span className="sell-field-row">
          Tickets
          <em className="sell-ratio">
            {listing} / {cap} held
          </em>
        </span>
        <div className="sell-stepper">
          <button
            type="button"
            aria-label="One fewer ticket"
            disabled={listing <= 1}
            onClick={() => setCount(Math.max(1, listing - 1))}
          >
            −
          </button>
          <strong aria-live="polite">
            {listing} {listing === 1 ? 'ticket' : 'tickets'}
          </strong>
          <button
            type="button"
            aria-label="One more ticket"
            disabled={listing >= cap}
            onClick={() => setCount(Math.min(cap, listing + 1))}
          >
            +
          </button>
        </div>
      </div>
      <button
        type="button"
        className="pay-btn"
        onClick={() => {
          onList(picked)
          onClose()
        }}
      >
        {listing === 1 ? 'List ticket' : `List ${listing} tickets`}
      </button>
      <button type="button" className="ghost-btn" onClick={onClose}>
        Cancel
      </button>
    </aside>
  )
}
