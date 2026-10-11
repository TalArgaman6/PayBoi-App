export function FilterDrawer({ open, onClose, onClear, children }) {
  if (!open) return null

  return (
    <div className="drawer-root">
      <button
        type="button"
        className="drawer-scrim"
        onClick={onClose}
        aria-label="Close filters"
      />
      <aside className="drawer-panel" role="dialog" aria-label="Filter events">
        <header className="drawer-head">
          <h2>Filter</h2>
          <button type="button" className="drawer-text" onClick={onClear}>
            Reset
          </button>
        </header>
        <div className="drawer-body">{children}</div>
        <button type="button" className="pay-btn drawer-done" onClick={onClose}>
          Done
        </button>
      </aside>
    </div>
  )
}
