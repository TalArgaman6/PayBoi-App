import { assetUrl } from '../lib/format.js'
import { PassCode } from './PassCode.jsx'

const GIFT_MASKS = {
  door: 'icons/skip-door.png',
  pour: 'icons/first-pour.png',
  scooter: 'icons/scooter.png',
  afters: 'icons/afters-bracelet.png',
}

function GiftIcon({ id }) {
  if (GIFT_MASKS[id]) {
    return (
      <span
        className={`gift-icon is-mask${id === 'door' ? ' is-wide' : ''}`}
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
      className={`gift-icon${word ? ' is-word' : ''}`}
      viewBox={word ? '0 0 34 16' : '0 0 16 16'}
      aria-hidden="true"
    >
      {mark}
    </svg>
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
      <GiftIcon id={gift.id} />
      <em>{gift.label}</em>
      <b>{count}</b>
      {open ? <p className="gift-tip">{gift.hint}</p> : null}
      {open ? <PassCode gift={gift} onGranted={onGranted} /> : null}
    </li>
  )
}
