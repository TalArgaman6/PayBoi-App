export function FilterTabs({ label, filters, active, onChange }) {
  return (
    <div className="filter-row">
      {label ? <p className="filter-label">{label}</p> : null}
      <div className="filter-tabs">
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
