import { assetUrl } from '../lib/format.js'
import { addPass } from '../lib/passes.js'
import { PassCode } from './PassCode.jsx'

const GIFT_MASKS = {
  pour: 'icons/first-pour.png',
  scooter: 'icons/scooter.png',
  afters: 'icons/afters-bracelet.png',
}

function GiftIcon({ id }) {
  if (GIFT_MASKS[id]) {
    return (
      <span
        className={`gift-icon is-mask${id === 'afters' ? ' is-afters' : ''}`}
        style={{ '--icon': `url("${assetUrl(GIFT_MASKS[id])}")` }}
        aria-hidden="true"
      />
    )
  }

  const pen = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  const mark = {
    // Skip the door: an old lever key with a trefoil bow. Drawn upright on
    // the 16px grid, then rotated so it sits on the same diagonal as the
    // other marks instead of standing straight up.
    door: (
      <g transform="rotate(-38 8 8)">
        <circle {...pen} strokeWidth="1.15" cx="8" cy="2.95" r="1.42" />
        <circle {...pen} strokeWidth="1.15" cx="5.9" cy="4.55" r="1.42" />
        <circle {...pen} strokeWidth="1.15" cx="10.1" cy="4.55" r="1.42" />
        <path
          {...pen}
          strokeWidth="1.25"
          d="M8 6.05v7.15"
        />
        <path
          {...pen}
          strokeWidth="1.15"
          d="M6.95 9.15h2.1"
        />
        <path
          {...pen}
          strokeWidth="1.15"
          strokeLinecap="square"
          d="M8.25 11.1h1.75M8.25 12.75h1.45"
        />
      </g>
    ),
    greenroom: (
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M6.4 4.15C4.5 2.35 1.2 2.7.7 5.15 1.25 7.5 4.4 8.5 6.4 7.35zM9.6 4.15C11.5 2.35 14.8 2.7 15.3 5.15 14.75 7.5 11.6 8.5 9.6 7.35zM6.35 3.95h3.3v3.6h-3.3zM7.05 4.7h1.9v2.1h-1.9zM6.35 7.25 5.05 14.55 7.15 13.25 7.7 7.45zM9.65 7.25 10.95 14.55 8.85 13.25 8.3 7.45z"
      />
    ),
    plusone: (
      <>
        <circle {...pen} cx="6" cy="5.3" r="1.45" />
        <path {...pen} d="M3.2 12.3c.35-1.9 1.45-2.9 2.8-2.9s2.45 1 2.8 2.9" />
        <path {...pen} d="M11.3 6v3.1M9.75 7.55h3.1" />
      </>
    ),
    cab: (
      <text
        x="17"
        y="11.2"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontFamily="var(--font-ui), sans-serif"
        fontSize="8"
        fontWeight="700"
        letterSpacing="0.4"
      >
        TAXI
      </text>
    ),
  }[id]

  const word = id === 'cab'

  return (
    <svg
      className={`gift-icon${word ? ' is-word' : ''}${id === 'door' ? ' is-key' : ''}`}
      viewBox={word ? '0 0 34 16' : '0 0 16 16'}
      aria-hidden="true"
    >
      {mark}
    </svg>
  )
}

/*
 * How many of the category you are holding, as a bar that runs further the
 * more you have. The length is the count itself, not a share of it — one is
 * a stub, ten fills the cell — so two rows can be compared by their ends
 * without reading either number.
 */
const CHARGE_FULL = 10

function ChargeBar({ count }) {
  const held = Math.max(0, Number(count) || 0)
  const run = Math.min(held, CHARGE_FULL) / CHARGE_FULL

  return (
    <b
      className={`gift-charge${held === 0 ? ' is-spent' : ''}`}
      style={{ '--charge': run }}
      aria-label={`${held} left`}
    >
      <i />
    </b>
  )
}

export function RiderRow({ gift, count, open, lit, onHover, onToggle, onGranted }) {
  function onKeyDown(event) {
    if (event.target !== event.currentTarget) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onToggle()
  }

  return (
    <li
      className={`${open ? 'is-open' : ''} ${lit ? 'is-lit' : ''}`.trim()}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onPointerEnter={() => onHover(gift.id)}
      onPointerLeave={() => onHover(null)}
      onClick={onToggle}
      onKeyDown={onKeyDown}
    >
      {/* The mark is a way of coming by another one. A night hands these out
          as it goes — a second drink, one more ride — so pressing the perk's
          own icon adds one to the holding without opening the row, and the
          bar beside it runs a step further. */}
      <button
        type="button"
        className="gift-add"
        aria-label={`Add one ${gift.label}`}
        onClick={(event) => {
          event.stopPropagation()
          addPass(gift)
        }}
      >
        <GiftIcon id={gift.id} />
      </button>
      <em>{gift.label}</em>
      <ChargeBar count={count} />
      {open ? <p className="gift-tip">{gift.hint}</p> : null}
      {open ? <PassCode gift={gift} onGranted={onGranted} /> : null}
    </li>
  )
}
