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
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}
