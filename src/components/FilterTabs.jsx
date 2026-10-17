import { TokenMark } from './TokenMark.jsx'

function TabLabel({ label }) {
  // Splits on the placeholder and on the bare word, so a label written either
  // way still comes out as the mark.
  const parts = String(label).split(/(\{pck\}|pck)/i)
  return parts.map((part, index) =>
    /^(\{pck\}|pck)$/i.test(part) ? (
      <TokenMark key={index} className="pbs-unit" />
    ) : (
      part
    ),
  )
}

export function FilterTabs({ label, note, filters, active, onChange, size }) {
  return (
    <div className="filter-row">
      {label ? <p className="filter-label">{label}</p> : null}
      {note ? <p className="filter-note">{note}</p> : null}
      <div className={`filter-tabs${size === 'sm' ? ' is-sm' : ''}`}>
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={filter.id === active ? 'is-active' : ''}
            onClick={() => onChange(filter.id)}
          >
            <TabLabel label={filter.label} />
          </button>
        ))}
      </div>
    </div>
  )
}
