const TABS = [
  { id: 'events', label: 'Events' },
  { id: 'shop', label: 'Drop' },
  { id: 'marketplace', label: 'Market' },
  { id: 'feed', label: 'Feed' },
  { id: 'wallet', label: 'Wallet' },
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
