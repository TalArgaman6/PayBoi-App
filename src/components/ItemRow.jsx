import { EarnBadge } from './EarnBadge.jsx'

export function assetUrl(path) {
  if (!path) return ''
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

export function ItemThumb({ thumb, title, image }) {
  const label = thumb?.label || title.slice(0, 2).toUpperCase()

  if (image) {
    return (
      <div className="item-thumb">
        <img src={assetUrl(image)} alt="" />
      </div>
    )
  }

  return (
    <div
      className="item-thumb"
      style={{
        background: `linear-gradient(145deg, ${thumb?.from || '#4a4548'}, ${thumb?.to || '#d1b45f'})`,
      }}
      aria-hidden="true"
    >
      <span>{label}</span>
    </div>
  )
}

export function ItemRow({ item, meta, onSelect }) {
  return (
    <button type="button" className="item-row" onClick={() => onSelect?.(item)}>
      <ItemThumb thumb={item.thumb} title={item.title} image={item.image} />
      <div className="item-copy">
        <strong>{item.title}</strong>
        {item.subtitle ? <span className="item-sub">{item.subtitle}</span> : null}
        {meta ? <span className="item-meta">{meta}</span> : null}
      </div>
      <EarnBadge item={item} />
    </button>
  )
}
