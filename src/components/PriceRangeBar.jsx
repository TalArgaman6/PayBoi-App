import { PRICE_SLIDER } from '../lib/filters.js'

export function PriceRangeBar({ min, max, onChange, formatValue }) {
  const span = PRICE_SLIDER.max - PRICE_SLIDER.min || 1
  const left = ((min - PRICE_SLIDER.min) / span) * 100
  const right = ((max - PRICE_SLIDER.min) / span) * 100

  function setMin(next) {
    onChange(Math.min(Number(next), max), max)
  }

  function setMax(next) {
    onChange(min, Math.max(Number(next), min))
  }

  return (
    <div className="filter-row">
      <p className="filter-label">Price</p>
      <p className="price-range-readout">
        {formatValue(min)} – {formatValue(max)}
      </p>
      <div className="price-range">
        <div className="price-range-track" />
        <div
          className="price-range-fill"
          style={{ left: `${left}%`, width: `${right - left}%` }}
        />
        <input
          type="range"
          min={PRICE_SLIDER.min}
          max={PRICE_SLIDER.max}
          step={PRICE_SLIDER.step}
          value={min}
          aria-label="Minimum price"
          onChange={(event) => setMin(event.target.value)}
          style={{ zIndex: min > PRICE_SLIDER.max - 40 ? 5 : 3 }}
        />
        <input
          type="range"
          min={PRICE_SLIDER.min}
          max={PRICE_SLIDER.max}
          step={PRICE_SLIDER.step}
          value={max}
          aria-label="Maximum price"
          onChange={(event) => setMax(event.target.value)}
        />
      </div>
    </div>
  )
}
