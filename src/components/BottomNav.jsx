const TABS = [
  { id: 'events', label: 'Events' },
  { id: 'shop', label: 'Spend' },
  { id: 'marketplace', label: 'Marketplace' },
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
