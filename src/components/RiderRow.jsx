import { PassCode } from './PassCode.jsx'

function GiftIcon({ id }) {
  const pen = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  const mark = {
    greenroom: (
      <>
        <path {...pen} d="M8 8 2 4.2v7.6L8 8z" />
        <path {...pen} d="M8 8 14 4.2v7.6L8 8z" />
        <path {...pen} d="M7.05 6.15h1.9v3.7h-1.9z" />
      </>
    ),
    door: (
      <>
        <path {...pen} d="M2.8 8h6.2" />
        <path {...pen} d="M6.8 5.3 9.6 8 6.8 10.7" />
        <path {...pen} d="M12.2 3.8v8.4" />
      </>
    ),
    plusone: (
      <>
        <circle {...pen} cx="6" cy="5.3" r="1.45" />
        <path {...pen} d="M3.2 12.3c.35-1.9 1.45-2.9 2.8-2.9s2.45 1 2.8 2.9" />
        <path {...pen} d="M11.3 6v3.1M9.75 7.55h3.1" />
      </>
    ),
    afters: (
      <path
        {...pen}
        d="M9.4 3.3a4.15 4.15 0 1 0 3.15 6.9A3.45 3.45 0 0 1 9.4 3.3z"
      />
    ),
    pour: (
      <>
        <path {...pen} d="M5.3 3.2h5.4L9.3 8a1.55 1.55 0 0 1-2.6 0L5.3 3.2z" />
        <path {...pen} d="M8 9.4v2.3M6.2 12.6h3.6" />
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
    scooter: (
      <>
        <circle {...pen} cx="4.2" cy="12.2" r="1.45" />
        <circle {...pen} cx="11.6" cy="12.2" r="1.45" />
        <path {...pen} d="M5.5 11.2h4.4" />
        <path {...pen} d="M9.9 11.2 11.1 4.5" />
        <path {...pen} d="M8.8 4.5h3.4" />
      </>
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
