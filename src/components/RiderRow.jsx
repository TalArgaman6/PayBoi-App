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
      <span />
      <em>{gift.label}</em>
      <b>{gift.count}</b>
      {open ? <p className="gift-tip">{gift.hint}</p> : null}
    </li>
  )
}
