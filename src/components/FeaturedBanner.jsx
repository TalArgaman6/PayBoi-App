import { useEffect, useState } from 'react'
import { assetUrl } from '../lib/format.js'

export function FeaturedBanner({ items, onSelect }) {
  const [index, setIndex] = useState(0)
  const current = items[index]

  useEffect(() => {
    if (items.length < 2) return undefined
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % items.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [items.length])

  if (!current) return null

  return (
    <div className="feature-banner">
      <button
        type="button"
        className="feature-slide"
        onClick={() => onSelect(current)}
        aria-label={current.title}
      >
        {/* The artwork carries the slide on its own — no copy over it. The
            title lives on the button's label so the slide is still named to
            a screen reader. */}
        <img src={assetUrl(current.banner || current.image)} alt="" />
      </button>
      <div className="feature-dots">
        {items.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            className={itemIndex === index ? 'is-on' : ''}
            aria-label={`Show ${item.title}`}
            onClick={() => setIndex(itemIndex)}
          />
        ))}
      </div>
    </div>
  )
}
