import { assetUrl } from '../lib/format.js'

/*
 * Six renders of the same crystal, each lit from a key light 60 degrees
 * further around the circle. Crossfading between them moves the light source
 * rather than sliding a highlight over a static picture: individual triangles
 * brighten and fall off as the source swings, and because the lights ring the
 * full circle the highlight can travel anywhere. App.css does the weighting.
 */
const LIGHT_FRAMES = [
  'wallet-crystal-1.webp?v=facet5',
  'wallet-crystal-2.webp?v=facet5',
  'wallet-crystal-3.webp?v=facet5',
  'wallet-crystal-4.webp?v=facet5',
  'wallet-crystal-5.webp?v=facet5',
  'wallet-crystal-6.webp?v=facet5',
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
          loading="eager"
          decoding="async"
        />
      ))}
    </div>
  )
}
