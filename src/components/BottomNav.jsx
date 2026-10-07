const TABS = [
  { id: 'wallet', label: 'Wallet' },
  { id: 'feed', label: 'Feed' },
  { id: 'events', label: 'Events' },
  { id: 'marketplace', label: 'Market' },
]

export function BottomNav({ tab, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={item.id === tab ? 'is-active' : ''}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
