import { assetUrl } from '../lib/format.js'

/*
 * Three renders of the same crystal, each lit from a different angle.
 * Crossfading between them moves the light across the facets rather than
 * sliding a highlight over a static picture: individual triangles brighten
 * and fall off as the source swings around.
 */
const LIGHT_FRAMES = [
  'wallet-crystal-1.png?v=sharp',
  'wallet-crystal-2.png?v=sharp',
  'wallet-crystal-3.png?v=sharp',
]

export function WalletSky() {
  return (
    <div className="wallet-wash" aria-hidden="true">
      {LIGHT_FRAMES.map((frame, index) => (
        <img
          key={frame}
          className={`wallet-opal wallet-opal-${index + 1}`}
          src={assetUrl(frame)}
          alt=""
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
    </div>
  )
}
