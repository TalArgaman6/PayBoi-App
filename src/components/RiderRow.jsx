export function RiderRow({ gift, share, open, lit, onHover, onLight, onToggle }) {
  return (
    <li
      className={`${open ? 'is-open' : ''} ${lit ? 'is-lit' : ''}`.trim()}
      onPointerEnter={() => onHover(gift.id)}
      onPointerLeave={() => onHover(null)}
      onClick={() => onLight(gift.id)}
    >
      <span style={{ background: gift.color }} />
      <em>{gift.label}</em>
      <b>{gift.count}</b>
      <small>{share}%</small>
      <button
        type="button"
        className="gift-info"
        aria-expanded={open}
        aria-label={`About ${gift.label}`}
        title={gift.hint}
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
      >
        i
      </button>
      {open ? (
        <p className="gift-tip" style={{ '--tag': gift.color }}>
          {gift.hint}
        </p>
      ) : null}
    </li>
  )
}
