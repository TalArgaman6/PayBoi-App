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
        <path
          {...pen}
          d="M2.1 8.4c1-2.3 2.7-3.2 4.6-2.4.6.6 1.1.9 1.3 1 .2-.1.7-.4 1.3-1 1.9-.8 3.6.1 4.6 2.4-1 2.1-2.7 2.8-4.6 2-.6-.5-1-.7-1.3-.7s-.7.2-1.3.7c-1.9.8-3.6.1-4.6-2z"
        />
        <ellipse {...pen} cx="5.6" cy="8.5" rx="1.2" ry=".95" />
        <ellipse {...pen} cx="10.4" cy="8.5" rx="1.2" ry=".95" />
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
      <>
        <path {...pen} d="M1.5 9.1h2.6l1.7-3.1h3.5l1.8 3.1H14.5v2.3H1.5z" />
        <path {...pen} d="M6.2 8.7 7.3 6.5h2.1l1.1 2.2" />
        <circle {...pen} cx="4.5" cy="11.8" r="1.25" />
        <circle {...pen} cx="11.5" cy="11.8" r="1.25" />
      </>
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

  return (
    <svg className="gift-icon" viewBox="0 0 16 16" aria-hidden="true">
      {mark}
    </svg>
  )
}

export function RiderRow({ gift, open, lit, onHover, onToggle }) {
  function onKeyDown(event) {
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
      <b>{gift.count}</b>
      {open ? <p className="gift-tip">{gift.hint}</p> : null}
    </li>
  )
}
