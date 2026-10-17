import { assetUrl } from '../lib/format.js'

/*
 * The currency, as the mark rather than the word. One component because it
 * turns up on the card, on a price and on an earn plate, and all three want
 * the same thing: the drawing painted in whatever colour the type beside it
 * is, at whatever size that type is set.
 *
 * A mask rather than an image, so `currentColor` reaches it — which is what
 * carries it through the wallet's bone ground, where the whole balance line
 * flips to ink. Sized in em for the same reason: it follows the type it
 * stands in instead of needing a pixel value at every site.
 */
export function TokenMark({ className = '' }) {
  return (
    <span
      className={`token-mark${className ? ` ${className}` : ''}`}
      style={{ '--icon': `url("${assetUrl('brand/peck-feather.png')}")` }}
      role="img"
      aria-label="pck"
    />
  )
}
